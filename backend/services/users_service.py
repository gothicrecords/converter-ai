"""
Users service - handles user statistics and operations
"""
import logging
from typing import Dict, Optional
# Neon/PostgreSQL is optional
try:
    import psycopg2
    from psycopg2 import pool
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class UsersService:
    """Service for user operations"""
    
    def __init__(self):
        """Initialize users service"""
        if PSYCOPG2_AVAILABLE and (settings.NEON_DATABASE_URL or settings.DATABASE_URL):
            db_url = settings.NEON_DATABASE_URL or settings.DATABASE_URL
            try:
                self.db_pool = psycopg2.pool.SimpleConnectionPool(1, 5, db_url)
            except Exception as e:
                logger.warning(f"Could not connect to Neon database: {e}")
                self.db_pool = None
        else:
            self.db_pool = None
            logger.warning("Neon database not configured - user features will be limited")
    
    async def get_stats(self, user_id: str) -> Dict:
        """Get user statistics"""
        if not self.supabase:
            return {
                'images_processed': 0,
                'tools_used': [],
            }
        
        result = self.supabase.table('users').select('images_processed,tools_used').eq('id', user_id).execute()
        
        if result.data:
            user = result.data[0]
            return {
                'images_processed': user.get('images_processed', 0),
                'tools_used': user.get('tools_used', []),
            }
        
        return {
            'images_processed': 0,
            'tools_used': [],
        }
    
    async def update_stats(self, user_id: str, tool_name: str) -> Dict:
        """Update user statistics"""
        if not self.supabase:
            raise ValueError("Supabase not configured")
        
        # Get current user data
        result = self.supabase.table('users').select('images_processed,tools_used').eq('id', user_id).execute()
        
        if not result.data:
            raise ValueError("User not found")
        
        user = result.data[0]
        tools_used = user.get('tools_used', [])
        
        if tool_name not in tools_used:
            tools_used.append(tool_name)
        
        # Update user
        update_data = {
            'images_processed': user.get('images_processed', 0) + 1,
            'tools_used': tools_used,
        }
        
        result = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
        
        if result.data:
            return result.data[0]
        
        raise ValueError("Failed to update user stats")

