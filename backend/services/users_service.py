"""
Users service - handles user statistics and operations
"""
import logging
from typing import Dict, Optional
from supabase import create_client, Client
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class UsersService:
    """Service for user operations"""
    
    def __init__(self):
        """Initialize users service"""
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        else:
            self.supabase = None
            logger.warning("Supabase not configured - user features will be limited")
    
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

