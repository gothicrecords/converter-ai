"""
Auth service - handles authentication using Supabase
"""
import logging
from typing import Dict, Optional
import secrets
from datetime import datetime, timedelta
from supabase import create_client, Client
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """Service for authentication"""
    
    def __init__(self):
        """Initialize auth service"""
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        else:
            self.supabase = None
            logger.warning("Supabase not configured - auth features will be limited")
    
    async def register_user(self, name: str, email: str, password: str) -> Dict:
        """Register a new user"""
        if not self.supabase:
            raise ValueError("Supabase not configured")
        
        # Check if user exists
        existing = self.supabase.table('users').select('id').eq('email', email).execute()
        if existing.data:
            raise ValueError("Email already registered")
        
        # Hash password (Supabase handles this, but we can use bcrypt for consistency)
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password_hash = pwd_context.hash(password)
        
        # Create user
        user_data = {
            'email': email,
            'name': name,
            'password_hash': password_hash,
            'created_at': datetime.utcnow().isoformat(),
        }
        
        result = self.supabase.table('users').insert(user_data).execute()
        user = result.data[0] if result.data else None
        
        if not user:
            raise ValueError("Failed to create user")
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        session_data = {
            'user_id': user['id'],
            'session_token': session_token,
            'expires_at': expires_at,
        }
        
        self.supabase.table('user_sessions').insert(session_data).execute()
        
        # Remove password hash from response
        user.pop('password_hash', None)
        
        return {
            'user': user,
            'sessionToken': session_token,
            'expiresAt': expires_at,
        }
    
    async def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate user"""
        if not self.supabase:
            raise ValueError("Supabase not configured")
        
        # Get user
        result = self.supabase.table('users').select('*').eq('email', email).execute()
        if not result.data:
            raise ValueError("Invalid email or password")
        
        user = result.data[0]
        
        # Verify password
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        if not pwd_context.verify(password, user.get('password_hash', '')):
            raise ValueError("Invalid email or password")
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        session_data = {
            'user_id': user['id'],
            'session_token': session_token,
            'expires_at': expires_at,
        }
        
        self.supabase.table('user_sessions').insert(session_data).execute()
        
        # Remove password hash from response
        user.pop('password_hash', None)
        
        return {
            'user': user,
            'sessionToken': session_token,
            'expiresAt': expires_at,
        }
    
    async def get_user_from_session(self, session_token: str) -> Optional[Dict]:
        """Get user from session token"""
        if not self.supabase or not session_token:
            return None
        
        # Get session
        result = self.supabase.table('user_sessions').select('*').eq('session_token', session_token).execute()
        if not result.data:
            return None
        
        session = result.data[0]
        
        # Check if expired
        expires_at = datetime.fromisoformat(session['expires_at'].replace('Z', '+00:00'))
        if expires_at < datetime.utcnow():
            return None
        
        # Get user
        user_result = self.supabase.table('users').select('*').eq('id', session['user_id']).execute()
        if not user_result.data:
            return None
        
        user = user_result.data[0]
        user.pop('password_hash', None)
        
        return user
    
    async def logout(self, session_token: str) -> bool:
        """Logout user by deleting session"""
        if not self.supabase or not session_token:
            return False
        
        try:
            self.supabase.table('user_sessions').delete().eq('session_token', session_token).execute()
            return True
        except Exception:
            return False

