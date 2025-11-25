"""
Auth service - handles authentication using Neon (PostgreSQL)
"""
import logging
from typing import Dict, Optional
import secrets
from datetime import datetime, timedelta
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Neon/PostgreSQL is optional
try:
    import psycopg2
    from psycopg2 import pool
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logger.warning("psycopg2 not available - database features will be limited")


class AuthService:
    """Service for authentication using Neon PostgreSQL"""
    
    def __init__(self):
        """Initialize auth service"""
        if PSYCOPG2_AVAILABLE and (settings.NEON_DATABASE_URL or settings.DATABASE_URL):
            db_url = settings.NEON_DATABASE_URL or settings.DATABASE_URL
            try:
                self.db_pool = psycopg2.pool.SimpleConnectionPool(1, 5, db_url)
            except Exception as e:
                logger.warning(f"Could not connect to Neon database: {e}")
                self.db_pool = None
        else:
            self.db_pool = None
            logger.warning("Neon database not configured - auth features will be limited")
    
    def _get_connection(self):
        """Get database connection from pool"""
        if not self.db_pool:
            raise ValueError("Database not configured")
        return self.db_pool.getconn()
    
    def _return_connection(self, conn):
        """Return connection to pool"""
        if self.db_pool:
            self.db_pool.putconn(conn)
    
    async def register_user(self, name: str, email: str, password: str) -> Dict:
        """Register a new user"""
        if not self.db_pool:
            raise ValueError("Database not configured")
        
        conn = None
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            
            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                raise ValueError("Email already registered")
            
            # Hash password
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            password_hash = pwd_context.hash(password)
            
            # Create user
            cur.execute(
                """INSERT INTO users (email, name, password_hash, created_at)
                   VALUES (%s, %s, %s, %s) RETURNING id, email, name, created_at""",
                (email, name, password_hash, datetime.utcnow())
            )
            user = cur.fetchone()
            conn.commit()
            
            if not user:
                raise ValueError("Failed to create user")
            
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
            conn.commit()
            
            return {
                'user': user_dict,
                'sessionToken': session_token,
                'expiresAt': expires_at.isoformat(),
            }
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                self._return_connection(conn)
    
    async def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate user"""
        if not self.db_pool:
            raise ValueError("Database not configured")
        
        conn = None
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            
            # Get user
            cur.execute("SELECT id, email, name, password_hash, created_at FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            
            if not user:
                raise ValueError("Invalid email or password")
            
            # Verify password
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            if not pwd_context.verify(password, user[3]):
                raise ValueError("Invalid email or password")
            
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
            conn.commit()
            
            return {
                'user': user_dict,
                'sessionToken': session_token,
                'expiresAt': expires_at.isoformat(),
            }
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                self._return_connection(conn)
    
    async def get_user_from_session(self, session_token: str) -> Optional[Dict]:
        """Get user from session token"""
        if not self.db_pool or not session_token:
            return None
        
        conn = None
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            
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
        except Exception:
            return None
        finally:
            if conn:
                self._return_connection(conn)
    
    async def logout(self, session_token: str) -> bool:
        """Logout user by deleting session"""
        if not self.db_pool or not session_token:
            return False
        
        conn = None
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
            conn.commit()
            return cur.rowcount > 0
        except Exception:
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                self._return_connection(conn)
    
    async def register_or_login_oauth_user(
        self, 
        provider: str, 
        provider_id: str, 
        email: str, 
        name: str, 
        avatar_url: Optional[str] = None
    ) -> Dict:
        """Register or login OAuth user"""
        if not self.db_pool:
            raise ValueError("Database not configured")
        
        conn = None
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            
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
                conn.commit()
                
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
                conn.commit()
                
                if not user:
                    raise ValueError("Failed to create user")
                
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
            conn.commit()
            
            return {
                'user': user_dict,
                'sessionToken': session_token,
                'expiresAt': expires_at.isoformat(),
            }
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                self._return_connection(conn)