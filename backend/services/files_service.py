"""
Files service - handles file operations
"""
import logging
from typing import Dict, Optional, List
from supabase import create_client, Client
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class FilesService:
    """Service for file operations"""
    
    def __init__(self):
        """Initialize files service"""
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        else:
            self.supabase = None
            logger.warning("Supabase not configured - file features will be limited")
    
    async def list_files(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        file_type: Optional[str] = None
    ) -> Dict:
        """List user files"""
        if not self.supabase:
            return {'files': [], 'pagination': {'page': 1, 'limit': limit, 'total': 0, 'totalPages': 0}}
        
        offset = (page - 1) * limit
        
        query = self.supabase.table('files').select('*', count='exact').eq('user_id', user_id)
        
        if search:
            query = query.or_(f'filename.ilike.%{search}%,original_filename.ilike.%{search}%')
        
        if file_type:
            query = query.eq('file_type', file_type)
        
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        return {
            'files': result.data or [],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': result.count or 0,
                'totalPages': (result.count or 0 + limit - 1) // limit,
            }
        }
    
    async def get_file(self, file_id: str, user_id: str) -> Optional[Dict]:
        """Get file by ID"""
        if not self.supabase:
            return None
        
        result = self.supabase.table('files').select('*').eq('id', file_id).eq('user_id', user_id).execute()
        
        if result.data:
            return result.data[0]
        return None
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        user_id: str,
        original_filename: Optional[str] = None
    ) -> Dict:
        """Upload file"""
        if not self.supabase:
            raise ValueError("Supabase not configured")
        
        import os
        from datetime import datetime
        
        # Generate unique filename
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{timestamp}_{os.urandom(8).hex()}{ext}"
        storage_path = f"{user_id}/{unique_filename}"
        
        # Upload to Supabase Storage
        storage_result = self.supabase.storage.from_('files').upload(
            storage_path,
            file_content,
            file_options={'content-type': 'application/octet-stream'}
        )
        
        if storage_result.error:
            raise ValueError(f"Storage upload failed: {storage_result.error}")
        
        # Get public URL
        url_result = self.supabase.storage.from_('files').get_public_url(storage_path)
        
        # Create file record
        file_data = {
            'user_id': user_id,
            'filename': unique_filename,
            'original_filename': original_filename or filename,
            'file_type': ext[1:] if ext else '',
            'file_size': len(file_content),
            'storage_path': storage_path,
            'processing_status': 'pending',
        }
        
        result = self.supabase.table('files').insert(file_data).execute()
        
        if result.data:
            file_record = result.data[0]
            file_record['url'] = url_result
            return file_record
        
        raise ValueError("Failed to create file record")

