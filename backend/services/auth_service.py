"""
Auth service - handles authentication using Neon (PostgreSQL)
"""
import logging
from typing import Dict, Optional
import secrets
from datetime import datetime, timedelta
from backend.config import get_settings
from backend.utils.database import db_pool
from backend.utils.exceptions import (
    ValidationException,
    AuthenticationException,
    ConflictException,
    DatabaseException,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """Service for authentication using Neon PostgreSQL"""
    
    def __init__(self):
        """Initialize auth service"""
        self.db_pool = db_pool
    
    async def register_user(self, name: str, email: str, password: str) -> Dict:
        """Register a new user"""
        if not self.db_pool._pool:
            raise DatabaseException("Database not configured")
        
        # Validate input
        if not name or len(name.strip()) < 2:
            raise ValidationException("Name must be at least 2 characters")
        if not email or "@" not in email:
            raise ValidationException("Invalid email address")
        if not password or len(password) < 8:
            raise ValidationException("Password must be at least 8 characters")
        
        try:
            with self.db_pool.get_cursor() as cur:
                # Check if user exists
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    raise ConflictException("Email already registered")
                
                # Hash password
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                password_hash = pwd_context.hash(password)
                
                # Create user
                cur.execute(
                    """INSERT INTO users (email, name, password_hash, created_at)
                       VALUES (%s, %s, %s, %s) RETURNING id, email, name, created_at""",
                    (email, name.strip(), password_hash, datetime.utcnow())
                )
                user = cur.fetchone()
                
                if not user:
                    raise DatabaseException("Failed to create user")
                
                user_dict = {
                    'id': user[0],
                    'email': user[1],
                    'name': user[2],
                    'created_at': user[3].isoformat() if user[3] else None,
                }
                
                # Create session
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.utcnow() + timedelta(days=7)
                
                cur.execute(
                    """INSERT INTO user_sessions (user_id, session_token, expires_at)
                       VALUES (%s, %s, %s)""",
                    (user_dict['id'], session_token, expires_at)
                )
                
                return {
                    'user': user_dict,
                    'sessionToken': session_token,
                    'expiresAt': expires_at.isoformat(),
                }
        except (ConflictException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Registration error: {e}", exc_info=True)
            raise DatabaseException("Registration failed") from e
    
    async def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate user"""
        if not self.db_pool._pool:
            raise DatabaseException("Database not configured")
        
        if not email or not password:
            raise ValidationException("Email and password are required")
        
        try:
            with self.db_pool.get_cursor() as cur:
                # Get user
                cur.execute(
                    "SELECT id, email, name, password_hash, created_at FROM users WHERE email = %s",
                    (email,)
                )
                user = cur.fetchone()
                
                if not user:
                    raise AuthenticationException("Invalid email or password")
                
                # Verify password
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                if not pwd_context.verify(password, user[3]):
                    raise AuthenticationException("Invalid email or password")
                
                user_dict = {
                    'id': user[0],
                    'email': user[1],
                    'name': user[2],
                    'created_at': user[4].isoformat() if user[4] else None,
                }
                
                # Create session
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.utcnow() + timedelta(days=7)
                
                cur.execute(
                    """INSERT INTO user_sessions (user_id, session_token, expires_at)
                       VALUES (%s, %s, %s)""",
                    (user_dict['id'], session_token, expires_at)
                )
                
                return {
                    'user': user_dict,
                    'sessionToken': session_token,
                    'expiresAt': expires_at.isoformat(),
                }
        except (AuthenticationException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Authentication error: {e}", exc_info=True)
            raise DatabaseException("Authentication failed") from e
    
    async def get_user_from_session(self, session_token: str) -> Optional[Dict]:
        """Get user from session token"""
        if not self.db_pool._pool or not session_token:
            return None
        
        try:
            with self.db_pool.get_cursor() as cur:
                # Get session
                cur.execute(
                    """SELECT user_id, expires_at FROM user_sessions 
                       WHERE session_token = %s""",
                    (session_token,)
                )
                session = cur.fetchone()
                
                if not session:
                    return None
                
                # Check if expired
                expires_at = session[1]
                if expires_at < datetime.utcnow():
                    return None
                
                # Get user
                cur.execute(
                    "SELECT id, email, name, created_at FROM users WHERE id = %s",
                    (session[0],)
                )
                user = cur.fetchone()
                
                if not user:
                    return None
                
                return {
                    'id': user[0],
                    'email': user[1],
                    'name': user[2],
                    'created_at': user[3].isoformat() if user[3] else None,
                }
        except Exception as e:
            logger.error(f"Get session error: {e}", exc_info=True)
            return None
    
    async def logout(self, session_token: str) -> bool:
        """Logout user by deleting session"""
        if not self.db_pool._pool or not session_token:
            return False
        
        try:
            with self.db_pool.get_cursor() as cur:
                cur.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
                return cur.rowcount > 0
        except Exception as e:
            logger.error(f"Logout error: {e}", exc_info=True)
            return False
    
    async def register_or_login_oauth_user(
        self, 
        provider: str, 
        provider_id: str, 
        email: str, 
        name: str, 
        avatar_url: Optional[str] = None
    ) -> Dict:
        """Register or login OAuth user"""
        if not self.db_pool._pool:
            raise DatabaseException("Database not configured")
        
        if not provider or not provider_id or not email:
            raise ValidationException("Provider, provider_id, and email are required")
        
        try:
            with self.db_pool.get_cursor() as cur:
                # Check if user exists by email or provider_id
                cur.execute(
                    """SELECT id, email, name, auth_provider, provider_id FROM users 
                       WHERE email = %s OR (auth_provider = %s AND provider_id = %s)""",
                    (email, provider, provider_id)
                )
                existing_user = cur.fetchone()
                
                if existing_user:
                    # User exists - update if needed and create session
                    user_id = existing_user[0]
                    
                    # Update OAuth info if changed
                    cur.execute(
                        """UPDATE users SET 
                           auth_provider = %s, 
                           provider_id = %s, 
                           provider_email = %s,
                           avatar_url = COALESCE(%s, avatar_url),
                           name = COALESCE(%s, name)
                           WHERE id = %s""",
                        (provider, provider_id, email, avatar_url, name, user_id)
                    )
                    
                    user_dict = {
                        'id': user_id,
                        'email': existing_user[1] or email,
                        'name': existing_user[2] or name,
                    }
                else:
                    # New user - create
                    cur.execute(
                        """INSERT INTO users (email, name, auth_provider, provider_id, provider_email, avatar_url, created_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, email, name, created_at""",
                        (email, name, provider, provider_id, email, avatar_url, datetime.utcnow())
                    )
                    user = cur.fetchone()
                    
                    if not user:
                        raise DatabaseException("Failed to create user")
                    
                    user_dict = {
                        'id': user[0],
                        'email': user[1],
                        'name': user[2],
                        'created_at': user[3].isoformat() if user[3] else None,
                    }
                
                # Create session
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.utcnow() + timedelta(days=7)
                
                cur.execute(
                    """INSERT INTO user_sessions (user_id, session_token, expires_at)
                       VALUES (%s, %s, %s)""",
                    (user_dict['id'], session_token, expires_at)
                )
                
                return {
                    'user': user_dict,
                    'sessionToken': session_token,
                    'expiresAt': expires_at.isoformat(),
                }
        except (ValidationException, DatabaseException):
            raise
        except Exception as e:
            logger.error(f"OAuth registration/login error: {e}", exc_info=True)
            raise DatabaseException("OAuth authentication failed") from e