"""
Converter service - handles file conversions
"""
import logging
from typing import Dict, Optional
import base64
from io import BytesIO
import os
import tempfile
import subprocess

from PIL import Image

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    cv2 = None
    np = None

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
        page: Optional[int] = None,
        vwidth: Optional[str] = None,
        vheight: Optional[str] = None,
        vbitrate: Optional[str] = None,
        abitrate: Optional[str] = None,
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
            lower_target = target_format.lower()
            
            # Handle image conversions
            image_targets = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'bmp', 'avif', 'heif', 'gif']
            if input_ext in ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'heif', 'pdf'] and lower_target in image_targets:
                return await self._convert_image(
                    file_content, original_filename, input_ext, lower_target, quality, width, height, page
                )
            
            # Handle audio/video conversions
            audio_formats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'weba', 'opus', 'ac3', 'aif', 'aiff', 'wma']
            video_formats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', '3gp', 'mpeg', 'mpg', 'ts', 'wmv']
            
            if lower_target in audio_formats or lower_target in video_formats:
                return await self._convert_audio_video(
                    file_content, original_filename, input_ext, lower_target, vwidth, vheight, vbitrate, abitrate
                )
            
            # Default: return original with new extension
            result_name = original_filename.rsplit('.', 1)[0] + f'.{target_format}'
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
        input_ext: str,
        target_format: str,
        quality: Optional[str] = None,
        width: Optional[str] = None,
        height: Optional[str] = None,
        page: Optional[int] = None,
    ) -> Dict[str, str]:
        """Convert image to target format"""
        try:
            # Open image
            image_input = BytesIO(file_content)
            
            # Handle PDF input
            if input_ext == 'pdf':
                try:
                    from pdf2image import convert_from_bytes
                    page_num = (page + 1) if page is not None and page >= 0 else 1
                    pages = convert_from_bytes(file_content, dpi=150, first_page=page_num, last_page=page_num)
                    if not pages:
                        raise ValueError("No pages found in PDF")
                    image = pages[0]
                except ImportError:
                    raise ValueError("pdf2image library not installed. Install it with: pip install pdf2image")
            else:
                image = Image.open(image_input)
            
            # Resize if needed (fit inside maintaining aspect ratio)
            if width or height:
                original_width, original_height = image.size
                w = int(width) if width else original_width
                h = int(height) if height else original_height
                
                # Calculate aspect ratio to fit inside
                aspect_ratio = original_width / original_height
                if w and h:
                    target_aspect = w / h
                    if aspect_ratio > target_aspect:
                        # Width is limiting factor
                        h = int(w / aspect_ratio)
                    else:
                        # Height is limiting factor
                        w = int(h * aspect_ratio)
                elif w:
                    h = int(w / aspect_ratio)
                elif h:
                    w = int(h * aspect_ratio)
                
                image = image.resize((w, h), Image.Resampling.LANCZOS)
            
            # Convert format
            if image.mode in ('RGBA', 'LA', 'P') and target_format.lower() in ('jpg', 'jpeg'):
                # Convert RGBA to RGB for JPEG
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode not in ('RGB', 'RGBA', 'L') and target_format.lower() in ('png', 'webp'):
                image = image.convert('RGB')
            
            # Save to buffer
            output_buffer = BytesIO()
            save_kwargs = {}
            
            # Set quality
            quality_int = int(quality) if quality else 80
            
            # Save based on format
            if target_format.lower() in ('jpg', 'jpeg'):
                image.save(output_buffer, format='JPEG', quality=quality_int, optimize=True)
            elif target_format.lower() == 'png':
                image.save(output_buffer, format='PNG', compress_level=9)
            elif target_format.lower() == 'webp':
                image.save(output_buffer, format='WEBP', quality=quality_int)
            elif target_format.lower() == 'avif':
                image.save(output_buffer, format='AVIF', quality=quality_int)
            elif target_format.lower() == 'tiff':
                image.save(output_buffer, format='TIFF')
            elif target_format.lower() == 'bmp':
                image.save(output_buffer, format='BMP')
            elif target_format.lower() == 'gif':
                image.save(output_buffer, format='GIF')
            else:
                image.save(output_buffer, format='PNG')
            
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
    
    async def _convert_audio_video(
        self,
        file_content: bytes,
        original_filename: str,
        input_ext: str,
        target_format: str,
        width: Optional[str] = None,
        height: Optional[str] = None,
        vbitrate: Optional[str] = None,
        abitrate: Optional[str] = None,
    ) -> Dict[str, str]:
        """Convert audio/video using FFmpeg"""
        try:
            import ffmpeg
            import platform
            
            # Set FFmpeg path on Windows
            if platform.system() == 'Windows':
                possible_paths = [
                    r'C:\ffmpeg\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe',
                    r'C:\ffmpeg\bin\ffmpeg.exe',
                    r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
                    os.path.join(os.environ.get('USERPROFILE', ''), 'ffmpeg', 'bin', 'ffmpeg.exe'),
                ]
                for path in possible_paths:
                    if os.path.exists(path):
                        os.environ['FFMPEG_BINARY'] = path
                        # Also set in PATH for subprocess
                        ffmpeg_dir = os.path.dirname(path)
                        if ffmpeg_dir not in os.environ.get('PATH', ''):
                            os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ.get('PATH', '')
                        break
            
            # Create temporary files
            tmp_dir = os.getenv('TEMP_DIR', '/tmp')
            os.makedirs(tmp_dir, exist_ok=True)
            
            input_path = os.path.join(tmp_dir, f"input_{os.urandom(8).hex()}.{input_ext}")
            output_path = os.path.join(tmp_dir, f"output_{os.urandom(8).hex()}.{target_format}")
            
            # Write input file
            with open(input_path, 'wb') as f:
                f.write(file_content)
            
            try:
                # Build FFmpeg command
                stream = ffmpeg.input(input_path)
                
                # Audio formats
                audio_formats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'weba', 'opus', 'ac3', 'aif', 'aiff', 'wma']
                if target_format in audio_formats:
                    audio_codec = self._get_audio_codec(target_format)
                    audio_bitrate = abitrate or ('160k' if target_format not in ['flac', 'wav'] else None)
                    
                    # Build output options (extract audio only)
                    output_opts = {'vn': None, 'acodec': audio_codec, 'ar': 44100, 'ac': 2}
                    if audio_bitrate:
                        output_opts['b:a'] = audio_bitrate
                    
                    # Format-specific options
                    if target_format == 'mp3':
                        output_opts['q:a'] = '3'  # Quality
                    elif target_format in ['aac', 'm4a']:
                        output_opts['profile:a'] = 'aac_low'
                    
                    stream = ffmpeg.output(stream, output_path, **output_opts)
                
                # Video formats
                else:
                    video_codec = self._get_video_codec(target_format)
                    video_bitrate = vbitrate or '1800k'
                    audio_bitrate = abitrate or '128k'
                    
                    output_opts = {
                        'vcodec': video_codec,
                        'video_bitrate': video_bitrate,
                        'b:a': audio_bitrate,
                    }
                    
                    # Audio codec based on video format
                    if target_format == 'mp4':
                        output_opts['acodec'] = 'aac'
                    elif target_format == 'webm':
                        output_opts['acodec'] = 'libvorbis'
                    else:
                        output_opts['acodec'] = 'aac'
                    
                    # Resize if specified
                    if width and height:
                        output_opts['s'] = f'{int(width)}x{int(height)}'
                    elif width:
                        output_opts['s'] = f'{int(width)}x?'
                    elif height:
                        output_opts['s'] = f'?x{int(height)}'
                    
                    # Thread optimization
                    output_opts['threads'] = '0'  # Use all available cores
                    
                    stream = ffmpeg.output(stream, output_path, **output_opts)
                
                # Run FFmpeg
                ffmpeg.run(stream, overwrite_output=True, quiet=True)
                
                # Read output file
                with open(output_path, 'rb') as f:
                    output_content = f.read()
                
                # Convert to data URL
                mime_type = self._get_mime_type(target_format)
                data_url = f"data:{mime_type};base64,{base64.b64encode(output_content).decode()}"
                
                result_name = original_filename.rsplit('.', 1)[0] + f'.{target_format}'
                
                return {
                    "name": result_name,
                    "data_url": data_url,
                }
            
            finally:
                # Cleanup
                try:
                    os.unlink(input_path)
                except:
                    pass
                try:
                    os.unlink(output_path)
                except:
                    pass
        
        except Exception as exc:
            logger.error(f"Audio/Video conversion error: {exc}", exc_info=True)
            raise
    
    def _get_audio_codec(self, format: str) -> str:
        """Get audio codec for format"""
        codecs = {
            'mp3': 'libmp3lame',
            'aac': 'aac',
            'm4a': 'aac',
            'flac': 'flac',
            'wav': 'pcm_s16le',
            'ogg': 'libvorbis',
            'opus': 'libopus',
            'weba': 'libopus',
        }
        return codecs.get(format.lower(), 'libmp3lame')
    
    def _get_video_codec(self, format: str) -> str:
        """Get video codec for format"""
        codecs = {
            'mp4': 'libx264',
            'webm': 'libvpx',
            'mkv': 'libx264',
            'avi': 'libxvid',
            'mov': 'libx264',
        }
        return codecs.get(format.lower(), 'libx264')
    
    def _get_mime_type(self, format: str) -> str:
        """Get MIME type for format"""
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'avif': 'image/avif',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'html': 'text/html',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'webm': 'video/webm',
            'mkv': 'video/x-matroska',
        }
        return mime_types.get(format.lower(), 'application/octet-stream')
