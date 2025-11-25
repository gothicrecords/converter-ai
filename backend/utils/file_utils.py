"""
File utilities for handling file operations
"""
import os
import tempfile
import base64
from typing import Tuple
from io import BytesIO


def get_temp_dir() -> str:
    """Get temporary directory path"""
    if os.getenv('VERCEL'):
        return '/tmp'
    return tempfile.gettempdir()


def save_temp_file(content: bytes, extension: str = '') -> Tuple[str, str]:
    """
    Save content to temporary file
    
    Returns:
        Tuple of (file_path, filename)
    """
    tmp_dir = get_temp_dir()
    os.makedirs(tmp_dir, exist_ok=True)
    
    filename = f"temp_{os.urandom(8).hex()}{extension}"
    file_path = os.path.join(tmp_dir, filename)
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    return file_path, filename


def cleanup_temp_file(file_path: str) -> None:
    """Remove temporary file"""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
    except Exception:
        pass


def to_data_url(content: bytes, mime_type: str) -> str:
    """Convert bytes to data URL"""
    base64_content = base64.b64encode(content).decode()
    return f"data:{mime_type};base64,{base64_content}"


def from_data_url(data_url: str) -> Tuple[bytes, str]:
    """Extract bytes and mime type from data URL"""
    if not data_url.startswith('data:'):
        raise ValueError("Invalid data URL format")
    
    # Parse data URL: data:mime;base64,content
    header, content = data_url.split(',', 1)
    mime_type = header.split(';')[0].split(':')[1]
    
    content_bytes = base64.b64decode(content)
    return content_bytes, mime_type

