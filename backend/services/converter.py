"""
Converter service - handles file conversions
"""
import logging
from typing import Dict, Optional
import base64
from io import BytesIO

from PIL import Image
import cv2
import numpy as np

logger = logging.getLogger(__name__)


class ConverterService:
    """Service for converting files between formats"""
    
    def __init__(self):
        """Initialize converter service"""
        pass
    
    async def convert(
        self,
        file_content: bytes,
        original_filename: str,
        target_format: str,
        quality: Optional[str] = None,
        width: Optional[str] = None,
        height: Optional[str] = None,
        page: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Convert file to target format
        
        Args:
            file_content: File content as bytes
            original_filename: Original filename
            target_format: Target format (jpg, png, pdf, etc.)
            quality: Quality setting (optional)
            width: Width setting (optional)
            height: Height setting (optional)
            page: Page number (optional)
        
        Returns:
            Dict with 'name' and 'data_url'
        """
        try:
            # Determine input format from filename
            input_ext = original_filename.split('.')[-1].lower() if '.' in original_filename else ''
            
            # Handle image conversions
            if input_ext in ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'] and target_format in ['jpg', 'jpeg', 'png', 'webp', 'bmp']:
                return await self._convert_image(
                    file_content, original_filename, target_format, quality, width, height
                )
            
            # Handle PDF conversions (will be handled by PDF service)
            if input_ext == 'pdf' or target_format == 'pdf':
                from backend.services.pdf_converter import PDFConverterService
                pdf_service = PDFConverterService()
                # Delegate to PDF service
                pass
            
            # Default: return original with new extension
            result_name = original_filename.rsplit('.', 1)[0] + f'.{target_format}'
            
            # Convert to data URL
            mime_type = self._get_mime_type(target_format)
            data_url = f"data:{mime_type};base64,{base64.b64encode(file_content).decode()}"
            
            return {
                "name": result_name,
                "data_url": data_url,
            }
        
        except Exception as exc:
            logger.error(f"Conversion error: {exc}", exc_info=True)
            raise
    
    async def _convert_image(
        self,
        file_content: bytes,
        original_filename: str,
        target_format: str,
        quality: Optional[str] = None,
        width: Optional[str] = None,
        height: Optional[str] = None,
    ) -> Dict[str, str]:
        """Convert image to target format"""
        try:
            # Open image
            image = Image.open(BytesIO(file_content))
            
            # Resize if needed
            if width or height:
                w = int(width) if width else image.width
                h = int(height) if height else image.height
                image = image.resize((w, h), Image.Resampling.LANCZOS)
            
            # Convert format
            if image.mode in ('RGBA', 'LA') and target_format.lower() in ('jpg', 'jpeg'):
                # Convert RGBA to RGB for JPEG
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode not in ('RGB', 'RGBA', 'L') and target_format.lower() in ('png', 'webp'):
                image = image.convert('RGB')
            
            # Save to buffer
            output_buffer = BytesIO()
            save_kwargs = {}
            
            # Set quality for JPEG
            if target_format.lower() in ('jpg', 'jpeg'):
                save_kwargs['quality'] = int(quality) if quality else 85
                save_kwargs['optimize'] = True
            elif target_format.lower() == 'webp':
                save_kwargs['quality'] = int(quality) if quality else 85
            
            # Save image
            image.save(output_buffer, format=target_format.upper(), **save_kwargs)
            output_buffer.seek(0)
            
            # Convert to data URL
            mime_type = self._get_mime_type(target_format)
            data_url = f"data:{mime_type};base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
            
            result_name = original_filename.rsplit('.', 1)[0] + f'.{target_format}'
            
            return {
                "name": result_name,
                "data_url": data_url,
            }
        
        except Exception as exc:
            logger.error(f"Image conversion error: {exc}", exc_info=True)
            raise
    
    def _get_mime_type(self, format: str) -> str:
        """Get MIME type for format"""
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'html': 'text/html',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        return mime_types.get(format.lower(), 'application/octet-stream')

