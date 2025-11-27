"""
Tools service - handles AI tools - complete implementation
"""
import logging
from typing import Dict, Optional, List, Tuple
import base64
from io import BytesIO
import os

from PIL import Image

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    cv2 = None

try:
    import skimage
    SKIMAGE_AVAILABLE = True
except ImportError:
    SKIMAGE_AVAILABLE = False

import numpy as np

logger = logging.getLogger(__name__)


class ToolsService:
    async def convert_video(
        self,
        file_content: bytes,
        filename: str,
        target_format: str = "mp4",
        vwidth: Optional[str] = None,
        vheight: Optional[str] = None,
        vbitrate: Optional[str] = None,
        abitrate: Optional[str] = None,
    ) -> Dict:
        """Convert video file to target format (mp4, avi, mov, webm, mkv, flv)"""
        try:
            import ffmpeg
            import platform
            import mimetypes
            
            # Validate target format
            valid_formats = ["mp4", "avi", "mov", "webm", "mkv", "flv", "3gp", "mpeg", "mpg", "ts", "wmv"]
            if target_format.lower() not in valid_formats:
                raise ValueError(f"Formato non supportato: {target_format}")
            
            # Validate file content
            if not file_content or len(file_content) == 0:
                raise ValueError("File is empty. Please upload a valid file.")
            
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
            
            # Get input extension from filename
            input_ext = filename.split('.')[-1].lower() if '.' in filename else 'mp4'
            input_path = os.path.join(tmp_dir, f"input_{os.urandom(8).hex()}.{input_ext}")
            output_path = os.path.join(tmp_dir, f"output_{os.urandom(8).hex()}.{target_format}")
            
            # Write input file
            with open(input_path, 'wb') as f:
                f.write(file_content)
            
            try:
                # Build FFmpeg command
                stream = ffmpeg.input(input_path)
                
                # Video codec and settings
                video_codec = self._get_video_codec(target_format)
                video_bitrate = vbitrate or '1800k'
                audio_bitrate = abitrate or '128k'
                
                output_opts = {
                    'vcodec': video_codec,
                    'video_bitrate': video_bitrate,
                    'b:a': audio_bitrate,
                }
                
                # Audio codec based on video format
                if target_format.lower() == 'mp4':
                    output_opts['acodec'] = 'aac'
                elif target_format.lower() == 'webm':
                    output_opts['acodec'] = 'libvorbis'
                else:
                    output_opts['acodec'] = 'aac'
                
                # Resize if specified
                if vwidth and vheight:
                    output_opts['s'] = f'{int(vwidth)}x{int(vheight)}'
                elif vwidth:
                    output_opts['s'] = f'{int(vwidth)}x?'
                elif vheight:
                    output_opts['s'] = f'?x{int(vheight)}'
                
                # Thread optimization
                output_opts['threads'] = '0'  # Use all available cores
                
                # Additional format-specific options
                if target_format.lower() == 'mp4':
                    output_opts['movflags'] = '+faststart'  # Web optimization
                elif target_format.lower() == 'webm':
                    output_opts['deadline'] = 'good'  # Encoding quality
                
                stream = ffmpeg.output(stream, output_path, **output_opts)
                
                # Run FFmpeg
                ffmpeg.run(stream, overwrite_output=True, quiet=True)
                
                # Read output file
                with open(output_path, 'rb') as f:
                    output_content = f.read()
                
                # Convert to data URL
                mime_type = mimetypes.guess_type(output_path)[0] or f"video/{target_format}"
                data_url = f"data:{mime_type};base64,{base64.b64encode(output_content).decode()}"
                
                result_name = filename.rsplit('.', 1)[0] + f'.{target_format}'
                
                return {
                    "url": data_url,
                    "name": result_name,
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
        except ImportError:
            raise RuntimeError("FFmpeg non installato o non disponibile nel backend.")
        except Exception as exc:
            logger.error(f"Convert video error: {exc}", exc_info=True)
            raise
    
    def _get_video_codec(self, format: str) -> str:
        """Get video codec for format"""
        codecs = {
            'mp4': 'libx264',
            'webm': 'libvpx',
            'mkv': 'libx264',
            'avi': 'libxvid',
            'mov': 'libx264',
            'flv': 'flv1',
            '3gp': 'h263',
            'mpeg': 'mpeg2video',
            'mpg': 'mpeg2video',
            'ts': 'libx264',
            'wmv': 'wmv2',
        }
        return codecs.get(format.lower(), 'libx264')

    async def convert_audio(
        self,
        file_content: bytes,
        filename: str,
        target_format: str = "mp3",
        abitrate: Optional[str] = None,
    ) -> Dict:
        """Convert audio file to target format (mp3, wav, flac, ogg, m4a, aac, weba, opus)"""
        try:
            import ffmpeg
            import platform
            import mimetypes
            
            # Validate target format
            valid_formats = ["mp3", "wav", "flac", "ogg", "m4a", "aac", "weba", "opus", "ac3", "aif", "aiff", "wma"]
            if target_format.lower() not in valid_formats:
                raise ValueError(f"Formato non supportato: {target_format}")
            
            # Validate file content
            if not file_content or len(file_content) == 0:
                raise ValueError("File is empty. Please upload a valid file.")
            
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
                        ffmpeg_dir = os.path.dirname(path)
                        if ffmpeg_dir not in os.environ.get('PATH', ''):
                            os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ.get('PATH', '')
                        break
            
            # Create temporary files
            tmp_dir = os.getenv('TEMP_DIR', '/tmp')
            os.makedirs(tmp_dir, exist_ok=True)
            
            # Get input extension from filename
            input_ext = filename.split('.')[-1].lower() if '.' in filename else 'mp3'
            input_path = os.path.join(tmp_dir, f"input_{os.urandom(8).hex()}.{input_ext}")
            output_path = os.path.join(tmp_dir, f"output_{os.urandom(8).hex()}.{target_format}")
            
            # Write input file
            with open(input_path, 'wb') as f:
                f.write(file_content)
            
            try:
                # Build FFmpeg command for audio
                stream = ffmpeg.input(input_path)
                
                # Audio codec and settings
                audio_codec = self._get_audio_codec(target_format)
                audio_bitrate = abitrate or ('160k' if target_format.lower() not in ['flac', 'wav'] else None)
                
                # Build output options (extract audio only, no video)
                output_opts = {
                    'vn': None,  # No video
                    'acodec': audio_codec,
                    'ar': 44100,  # Sample rate
                    'ac': 2,  # Audio channels (stereo)
                }
                
                if audio_bitrate:
                    output_opts['b:a'] = audio_bitrate
                
                # Format-specific options
                if target_format.lower() == 'mp3':
                    output_opts['q:a'] = '3'  # Quality (0-9, lower is better)
                elif target_format.lower() in ['aac', 'm4a']:
                    output_opts['profile:a'] = 'aac_low'
                    output_opts['movflags'] = '+faststart'  # Web optimization
                elif target_format.lower() in ['opus', 'weba']:
                    output_opts['compression_level'] = '5'  # Compression level
                
                stream = ffmpeg.output(stream, output_path, **output_opts)
                
                # Run FFmpeg
                ffmpeg.run(stream, overwrite_output=True, quiet=True)
                
                # Read output file
                with open(output_path, 'rb') as f:
                    output_content = f.read()
                
                # Convert to data URL
                mime_type = mimetypes.guess_type(output_path)[0] or f"audio/{target_format}"
                data_url = f"data:{mime_type};base64,{base64.b64encode(output_content).decode()}"
                
                result_name = filename.rsplit('.', 1)[0] + f'.{target_format}'
                
                return {
                    "url": data_url,
                    "name": result_name,
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
        except ImportError:
            raise RuntimeError("FFmpeg non installato o non disponibile nel backend.")
        except Exception as exc:
            logger.error(f"Convert audio error: {exc}", exc_info=True)
            raise
    
    def _get_audio_content_type(self, file_ext: str) -> str:
        """Get MIME content type for audio file extension"""
        content_types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4',
            '.ogg': 'audio/ogg',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac',
            '.weba': 'audio/webm',
            '.opus': 'audio/opus',
            '.mp4': 'audio/mp4',
            '.webm': 'audio/webm',
        }
        # Normalize extension
        ext = file_ext.lower()
        if not ext.startswith('.'):
            ext = f'.{ext}'
        return content_types.get(ext, 'audio/mpeg')
    
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
            'ac3': 'ac3',
            'aif': 'pcm_s16le',
            'aiff': 'pcm_s16le',
            'wma': 'wmav2',
        }
        return codecs.get(format.lower(), 'libmp3lame')

    async def convert_image(
        self,
        file_content: bytes,
        filename: str,
        target_format: str = "png",
        quality: Optional[str] = None,
        width: Optional[str] = None,
        height: Optional[str] = None,
    ) -> Dict:
        """Convert image file to target format (jpg, jpeg, png, webp, avif, tiff, bmp, gif)"""
        try:
            # Validate file content
            if not file_content or len(file_content) == 0:
                raise ValueError("File is empty. Please upload a valid file.")
            
            valid_formats = ["jpg", "jpeg", "png", "webp", "avif", "tiff", "bmp", "gif"]
            if target_format.lower() not in valid_formats:
                raise ValueError(f"Formato non supportato: {target_format}")
            
            # Open image
            image = Image.open(BytesIO(file_content))
            
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
            
            # Convert format (handle RGBA/transparency for JPEG)
            if image.mode in ('RGBA', 'LA', 'P') and target_format.lower() in ('jpg', 'jpeg'):
                # Convert RGBA to RGB for JPEG
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode not in ('RGB', 'RGBA', 'L') and target_format.lower() in ('png', 'webp', 'avif'):
                image = image.convert('RGB')
            
            # Save to buffer
            output_buffer = BytesIO()
            
            # Set quality
            quality_int = int(quality) if quality else 80
            
            # Save based on format
            if target_format.lower() in ('jpg', 'jpeg'):
                image.save(output_buffer, format='JPEG', quality=quality_int, optimize=True)
                mime_type = "image/jpeg"
            elif target_format.lower() == 'png':
                image.save(output_buffer, format='PNG', compress_level=9)
                mime_type = "image/png"
            elif target_format.lower() == 'webp':
                image.save(output_buffer, format='WEBP', quality=quality_int)
                mime_type = "image/webp"
            elif target_format.lower() == 'avif':
                image.save(output_buffer, format='AVIF', quality=quality_int)
                mime_type = "image/avif"
            elif target_format.lower() == 'tiff':
                image.save(output_buffer, format='TIFF')
                mime_type = "image/tiff"
            elif target_format.lower() == 'bmp':
                image.save(output_buffer, format='BMP')
                mime_type = "image/bmp"
            elif target_format.lower() == 'gif':
                image.save(output_buffer, format='GIF')
                mime_type = "image/gif"
            else:
                image.save(output_buffer, format='PNG')
                mime_type = "image/png"
            
            output_buffer.seek(0)
            
            # Convert to data URL
            data_url = f"data:{mime_type};base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
            
            result_name = filename.rsplit('.', 1)[0] + f'.{target_format}'
            
            return {
                "url": data_url,
                "name": result_name,
            }
        except Exception as exc:
            logger.error(f"Convert image error: {exc}", exc_info=True)
            raise

    # Service for AI tools

    def __init__(self):
        """Initialize tools service"""
        pass
    
    async def remove_background(
        self,
        file_content: bytes,
        filename: str,
        type: Optional[str] = None,
        size: Optional[str] = None,
        crop: Optional[str] = None,
        cropMargin: Optional[str] = None,
    ) -> Dict:
        """Remove background from image with advanced edge refinement"""
        try:
            # Validate file content
            if not file_content or len(file_content) == 0:
                raise ValueError("File is empty. Please upload a valid file.")
            
            # Use rembg library with model selection
            try:
                from rembg import remove, new_session
                from rembg.sessions import sessions_classes
                
                # Map type to model (use u2net for better quality, or specialized models)
                model_name = "u2net"  # Default high-quality model
                if type:
                    type_lower = type.lower()
                    if type_lower == "person":
                        model_name = "u2net_human_seg"  # Better for people
                    elif type_lower == "product":
                        model_name = "u2netp"  # Faster, good for products
                    elif type_lower == "car":
                        model_name = "silueta"  # Good for objects with clean edges
                    elif type_lower == "animal":
                        model_name = "isnet-general-use"  # Good for animals
                
                # Create session with model
                try:
                    session = new_session(model_name)
                    output = remove(file_content, session=session)
                except Exception as model_error:
                    # Fallback to default model if specific model fails
                    logger.warning(f"Model {model_name} failed, using default: {model_error}")
                    output = remove(file_content)
                
            except ImportError:
                # Fallback: use OpenCV for advanced background removal
                if not CV2_AVAILABLE:
                    raise RuntimeError("OpenCV (cv2) non disponibile per la rimozione dello sfondo. Installa rembg per risultati migliori.")
                
                image = Image.open(BytesIO(file_content))
                image_array = np.array(image)
                
                # Check shape and channels
                if len(image_array.shape) != 3 or image_array.shape[2] < 3:
                    raise ValueError("Immagine non valida o non RGB.")
                
                # Advanced background removal with edge detection and refinement
                if image_array.shape[2] == 3:
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2RGBA)
                
                # Convert to grayscale
                gray = cv2.cvtColor(image_array[:, :, :3], cv2.COLOR_RGB2GRAY)
                
                # Use advanced edge detection with multiple techniques
                height, width = gray.shape
                mask = np.zeros((height, width), np.uint8)
                
                # Method 1: Try GrabCut algorithm for better edge detection (if image is large enough)
                use_grabcut = width > 100 and height > 100
                if use_grabcut:
                    bgdModel = np.zeros((1, 65), np.float64)
                    fgdModel = np.zeros((1, 65), np.float64)
                    
                    # Define rectangle for GrabCut (use image bounds with small margin)
                    margin = min(10, width // 20, height // 20)
                    rect = (margin, margin, width - 2*margin, height - 2*margin)
                    
                    try:
                        cv2.grabCut(image_array[:, :, :3], mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
                        # Create final mask from GrabCut result
                        mask = np.where((mask == 2) | (mask == 0), 0, 255).astype('uint8')
                    except:
                        # Fallback to Otsu thresholding if GrabCut fails
                        use_grabcut = False
                
                # Method 2: Otsu thresholding (fallback or primary for small images)
                if not use_grabcut:
                    _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
                
                # Post-processing: Edge refinement using morphological operations
                kernel = np.ones((3, 3), np.uint8)
                mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)  # Fill small holes
                mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)   # Remove small noise
                
                # Optional: Find largest contour and use only that (removes small isolated regions)
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if contours:
                    # Find largest contour
                    largest_contour = max(contours, key=cv2.contourArea)
                    # Create new mask from largest contour
                    mask = np.zeros((height, width), np.uint8)
                    cv2.fillPoly(mask, [largest_contour], 255)
                
                # Smooth edges with Gaussian blur for better alpha blending
                mask = cv2.GaussianBlur(mask, (5, 5), 0.5)
                
                # Apply mask to alpha channel
                image_array[:, :, 3] = mask
                
                # Convert back to PIL Image and save
                output_buffer = BytesIO()
                output_image = Image.fromarray(image_array)
                output_image.save(output_buffer, format='PNG')
                output = output_buffer.getvalue()
            
            # Post-process to refine edges
            try:
                from PIL import Image, ImageFilter
                import numpy as np
                
                # Load output as PIL Image
                result_image = Image.open(BytesIO(output))
                
                # Convert to numpy array
                img_array = np.array(result_image)
                
                if img_array.shape[2] == 4:  # RGBA
                    # Extract alpha channel
                    alpha = img_array[:, :, 3]
                    
                    # Apply edge refinement with morphological operations
                    if CV2_AVAILABLE:
                        # Erode and dilate for cleaner edges
                        kernel = np.ones((2, 2), np.uint8)
                        alpha_refined = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
                        alpha_refined = cv2.morphologyEx(alpha_refined, cv2.MORPH_OPEN, kernel)
                        
                        # Apply slight blur to alpha for smoother edges
                        alpha_refined = cv2.GaussianBlur(alpha_refined, (3, 3), 0.5)
                        
                        # Update alpha channel
                        img_array[:, :, 3] = alpha_refined
                        
                        # Convert back to PIL Image
                        result_image = Image.fromarray(img_array)
                
                # Apply optional crop if requested
                if crop and crop.lower() in ['true', '1', 'yes']:
                    # Get bounding box of non-transparent pixels
                    bbox = result_image.getbbox()
                    if bbox:
                        # Get margin from parameter or use default
                        margin_percent = 8  # Default margin percentage
                        if cropMargin:
                            try:
                                margin_percent = float(cropMargin)
                            except (ValueError, TypeError):
                                pass
                        
                        x0, y0, x1, y1 = bbox
                        width, height = result_image.size
                        
                        # Calculate margin in pixels based on image size
                        margin_x = int((x1 - x0) * margin_percent / 100)
                        margin_y = int((y1 - y0) * margin_percent / 100)
                        
                        x0 = max(0, x0 - margin_x)
                        y0 = max(0, y0 - margin_y)
                        x1 = min(width, x1 + margin_x)
                        y1 = min(height, y1 + margin_y)
                        result_image = result_image.crop((x0, y0, x1, y1))
                
                # Save to buffer
                output_buffer = BytesIO()
                result_image.save(output_buffer, format='PNG', optimize=True)
                output = output_buffer.getvalue()
                
            except Exception as post_error:
                logger.warning(f"Post-processing failed, using original output: {post_error}")
                # Use original output if post-processing fails
            
            # Convert to data URL
            data_url = f"data:image/png;base64,{base64.b64encode(output).decode()}"
            
            result_name = filename.rsplit('.', 1)[0] + '_no_bg.png'
            
            return {
                "url": data_url,
                "name": result_name,
            }
        
        except Exception as exc:
            logger.error(f"Remove background error: {exc}", exc_info=True)
            raise
    
    async def upscale(
        self,
        file_content: bytes,
        filename: str,
        scale: int = 2,
    ) -> Dict:
        """Upscale image with advanced AI techniques"""
        try:
            # Open image
            image = Image.open(BytesIO(file_content))
            original_size = (image.width, image.height)
            
            # Calculate new size
            new_width = image.width * scale
            new_height = image.height * scale
            
            # Try advanced upscaling with scikit-image if available
            if SKIMAGE_AVAILABLE:
                from skimage.transform import resize
                from skimage import restoration
                import numpy as np
                # Convert PIL to numpy array
                img_array = np.array(image)
                # Denoise before upscaling
                if len(img_array.shape) == 3:
                    # Color image
                    denoised = np.zeros_like(img_array)
                    for i in range(img_array.shape[2]):
                        denoised[:, :, i] = restoration.denoise_tv_chambolle(
                            img_array[:, :, i], weight=0.1
                        )
                else:
                    # Grayscale
                    denoised = restoration.denoise_tv_chambolle(img_array, weight=0.1)
                # Upscale using LANCZOS (high quality)
                upscaled_array = resize(
                    denoised,
                    (new_height, new_width),
                    order=3,  # Bicubic interpolation (high quality)
                    anti_aliasing=True,
                    preserve_range=True
                ).astype(img_array.dtype)
                # Convert back to PIL
                upscaled = Image.fromarray(upscaled_array)
                # Apply sharpening filter
                from PIL import ImageFilter
                upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
            else:
                # Fallback to PIL LANCZOS if scikit-image not available
                upscaled = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save to buffer with high quality
            output_buffer = BytesIO()
            if filename.lower().endswith(('.jpg', '.jpeg')):
                upscaled.save(output_buffer, format='JPEG', quality=95, optimize=True)
                mime_type = 'image/jpeg'
            else:
                upscaled.save(output_buffer, format='PNG', optimize=True)
                mime_type = 'image/png'
            output_buffer.seek(0)
            
            # Convert to data URL
            data_url = f"data:{mime_type};base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
            
            result_name = filename.rsplit('.', 1)[0] + f'_x{scale}.{filename.rsplit(".", 1)[-1] if "." in filename else "png"}'
            
            return {
                "url": data_url,
                "name": result_name,
                "original_size": f"{original_size[0]}x{original_size[1]}",
                "new_size": f"{new_width}x{new_height}",
            }
        
        except Exception as exc:
            logger.error(f"Upscale error: {exc}", exc_info=True)
            raise
    
    async def compress_video(
        self,
        file_content: bytes,
        filename: str,
        quality: str = "medium",
    ) -> Dict:
        """Compress video"""
        try:
            import ffmpeg
            
            # Create temporary files
            tmp_dir = os.getenv('TEMP_DIR', '/tmp')
            os.makedirs(tmp_dir, exist_ok=True)
            
            input_path = os.path.join(tmp_dir, f"input_{os.urandom(8).hex()}.mp4")
            output_path = os.path.join(tmp_dir, f"output_{os.urandom(8).hex()}.mp4")
            
            # Write input file
            with open(input_path, 'wb') as f:
                f.write(file_content)
            
            try:
                # Quality settings
                quality_settings = {
                    'low': {'crf': 28, 'preset': 'fast'},
                    'medium': {'crf': 23, 'preset': 'medium'},
                    'high': {'crf': 18, 'preset': 'slow'},
                }
                settings = quality_settings.get(quality, quality_settings['medium'])
                
                # Build FFmpeg command
                stream = ffmpeg.input(input_path)
                stream = ffmpeg.output(
                    stream,
                    output_path,
                    vcodec='libx264',
                    crf=settings['crf'],
                    preset=settings['preset'],
                    acodec='aac',
                    audio_bitrate='128k',
                )
                
                # Run FFmpeg
                ffmpeg.run(stream, overwrite_output=True, quiet=True)
                
                # Read output file
                with open(output_path, 'rb') as f:
                    output_content = f.read()
                
                # Convert to data URL or return file
                data_url = f"data:video/mp4;base64,{base64.b64encode(output_content).decode()}"
                
                result_name = filename.rsplit('.', 1)[0] + '_compressed.mp4'
                
                return {
                    "url": data_url,
                    "name": result_name,
                }
            
            finally:
                # Cleanup
                try:
                    os.unlink(input_path)
                    os.unlink(output_path)
                except:
                    pass
        
        except Exception as exc:
            logger.error(f"Compress video error: {exc}", exc_info=True)
            raise
    
    async def transcribe_audio(
        self,
        file_content: bytes,
        filename: str,
    ) -> Dict:
        """Transcribe audio to text"""
        try:
            # Use OpenAI Whisper or similar
            import openai
            import tempfile
            from backend.config import get_settings
            
            settings = get_settings()
            
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
            
            # Create temporary file (cross-platform)
            # Use tempfile module for proper Windows support
            file_ext = os.path.splitext(filename)[1] or '.mp3'
            suffix = file_ext if file_ext.startswith('.') else f'.{file_ext}'
            
            # Create temporary file with proper extension
            # Write file content and close it before passing to OpenAI
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                input_path = tmp_file.name
                tmp_file.write(file_content)
                # File is automatically closed when exiting the 'with' block
            
            try:
                # Use OpenAI Whisper API
                client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                
                # OpenAI SDK accepts file path directly or file object
                # Open file in binary mode for upload (file is already written and closed)
                with open(input_path, 'rb') as audio_file:
                    # Create file tuple: (filename, file_object, content_type)
                    # This is the format expected by OpenAI SDK for file uploads
                    file_tuple = (filename, audio_file, self._get_audio_content_type(file_ext))
                    
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=file_tuple,
                        response_format="json",
                    )
                
                text = transcript.text
                
                return {
                    "text": text,
                    "language": getattr(transcript, 'language', 'en'),
                }
            
            finally:
                # Clean up temporary file
                try:
                    if os.path.exists(input_path):
                        os.unlink(input_path)
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup temp file {input_path}: {cleanup_error}")
        
        except ImportError as import_error:
            logger.error(f"OpenAI library not installed: {import_error}")
            raise ValueError("OpenAI library not installed. Install it with: pip install openai")
        except Exception as exc:
            logger.error(f"Transcribe audio error: {exc}", exc_info=True)
            raise
    
    async def ocr_advanced(
        self,
        file_content: bytes,
        filename: str,
    ) -> Dict:
        """Advanced OCR with multiple engines"""
        try:
            from PIL import Image
            
            # Check if it's a PDF
            if filename.lower().endswith('.pdf'):
                # Convert PDF to images
                try:
                    import fitz  # PyMuPDF
                    pdf_doc = fitz.open(stream=file_content, filetype="pdf")
                    
                    # Get first page as image
                    page = pdf_doc[0]
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x resolution
                    img_data = pix.tobytes("png")
                    image = Image.open(BytesIO(img_data))
                    pdf_doc.close()
                except Exception as e:
                    logger.error(f"PDF conversion error: {e}")
                    raise ValueError(f"Cannot convert PDF to image: {e}")
            else:
                # Open image directly
                image = Image.open(BytesIO(file_content))
            
            # Try EasyOCR first (more accurate, but slower)
            text = ""
            data = {}
            
            try:
                import easyocr
                import numpy as np
                reader = easyocr.Reader(['en', 'it'], gpu=False)  # Support English and Italian
                results = reader.readtext(np.array(image))
                
                # Extract text
                text = "\n".join([result[1] for result in results])
                
                # Format data similar to pytesseract
                data = {
                    'text': [result[1] for result in results],
                    'confidence': [result[2] for result in results],
                    'bbox': [result[0] for result in results],
                }
                
            except (ImportError, Exception) as e:
                logger.warning(f"EasyOCR not available, falling back to pytesseract: {e}")
                
                # Fallback to pytesseract
                try:
                    import pytesseract
                    
                    # Try to find Tesseract executable on Windows
                    import os
                    import platform
                    if platform.system() == 'Windows':
                        possible_paths = [
                            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                        ]
                        for path in possible_paths:
                            if os.path.exists(path):
                                pytesseract.pytesseract.tesseract_cmd = path
                                break
                    
                    text = pytesseract.image_to_string(image, lang='eng+ita')
                    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
                except ImportError:
                    raise ValueError("Neither EasyOCR nor pytesseract is available. Please install one of them.")
                except Exception as e:
                    # Tesseract not found
                    if "tesseract is not installed" in str(e).lower() or "not in your path" in str(e).lower():
                        raise ValueError(
                            "Tesseract OCR is not installed. "
                            "Please download from https://github.com/UB-Mannheim/tesseract/wiki and install it, "
                            "or use EasyOCR by installing: pip install easyocr"
                        )
                    raise
            
            return {
                "text": text,
                "data": data,
            }
        
        except Exception as exc:
            logger.error(f"OCR error: {exc}", exc_info=True)
            raise
    
    async def generate_image(
        self,
        prompt: str,
        style: Optional[str] = None,
        aspect: Optional[str] = "1:1",
        quality: Optional[str] = "standard",
    ) -> Dict:
        """Generate image from prompt using DALL-E"""
        try:
            import openai
            from backend.config import get_settings
            
            settings = get_settings()
            
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key not configured")
            
            # Map aspect ratios to DALL-E 3 sizes
            size_map = {
                '1:1': '1024x1024',
                '16:9': '1792x1024',
                '9:16': '1024x1792',
                '4:3': '1792x1024',
                '3:4': '1024x1792',
            }
            size = size_map.get(aspect, '1024x1024')
            
            # Generate image using DALL-E
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Use DALL-E 3 if available, otherwise DALL-E 2
            try:
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    n=1,
                    size=size,
                    quality=quality if quality in ['standard', 'hd'] else 'standard',
                    style=style if style in ['vivid', 'natural'] else 'vivid',
                )
            except Exception as e:
                # Fallback to DALL-E 2 if DALL-E 3 fails
                logger.warning(f"DALL-E 3 failed, using DALL-E 2: {e}")
                response = client.images.generate(
                    model="dall-e-2",
                    prompt=prompt,
                    n=1,
                    size="1024x1024",
                )
            
            image_url = response.data[0].url
            
            return {
                "url": image_url,
                "prompt": prompt,
                "model": "dall-e-3" if "dall-e-3" in str(response) else "dall-e-2",
                "size": size,
            }
        
        except Exception as exc:
            logger.error(f"Generate image error: {exc}", exc_info=True)
            raise
    
    async def combine_split_pdf(
        self,
        file_contents: List[Tuple[bytes, str]],
        mode: str = "combine",
        ranges: str = None,
    ) -> Dict:
        """Combine or split PDF files"""
        try:
            import pypdf
            
            if mode == "combine":
                # Combine PDFs
                if len(file_contents) < 2:
                    raise ValueError("At least 2 PDF files are required to combine")
                
                pdf_writer = pypdf.PdfWriter()
                
                for file_content, _ in file_contents:
                    pdf_reader = pypdf.PdfReader(BytesIO(file_content))
                    for page in pdf_reader.pages:
                        pdf_writer.add_page(page)
                
                # Save to buffer
                output_buffer = BytesIO()
                pdf_writer.write(output_buffer)
                output_buffer.seek(0)
                
                # Convert to data URL
                data_url = f"data:application/pdf;base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
                
                return {
                    "url": data_url,
                    "name": "combined.pdf",
                }
            else:
                # Split PDF
                if len(file_contents) == 0:
                    raise ValueError("At least 1 PDF file is required to split")
                
                pdf_reader = pypdf.PdfReader(BytesIO(file_contents[0][0]))
                total_pages = len(pdf_reader.pages)
                
                # Parse ranges (es: "1-3,5,7-10")
                page_indices = set()
                
                if not ranges or ranges.strip() == '':
                    # Se non ci sono ranges, restituisci tutte le pagine
                    page_indices = set(range(total_pages))
                else:
                    # Parse ranges
                    parts = [p.strip() for p in ranges.split(',')]
                    
                    for part in parts:
                        if '-' in part:
                            # Range (es: "1-3")
                            try:
                                start_str, end_str = part.split('-', 1)
                                start = int(start_str.strip())
                                end = int(end_str.strip())
                                
                                # Converti da 1-based a 0-based e valida
                                start_idx = max(0, start - 1)
                                end_idx = min(total_pages - 1, end - 1)
                                
                                if start_idx <= end_idx:
                                    for i in range(start_idx, end_idx + 1):
                                        page_indices.add(i)
                            except (ValueError, AttributeError):
                                continue
                        else:
                            # Pagina singola
                            try:
                                page_num = int(part.strip())
                                if 1 <= page_num <= total_pages:
                                    page_indices.add(page_num - 1)  # Converti da 1-based a 0-based
                            except (ValueError, AttributeError):
                                continue
                
                if len(page_indices) == 0:
                    raise ValueError("No valid pages specified")
                
                # Crea nuovo PDF con le pagine specificate
                pdf_writer = pypdf.PdfWriter()
                sorted_indices = sorted(page_indices)
                
                for idx in sorted_indices:
                    pdf_writer.add_page(pdf_reader.pages[idx])
                
                # Save to buffer
                output_buffer = BytesIO()
                pdf_writer.write(output_buffer)
                output_buffer.seek(0)
                
                # Convert to data URL
                data_url = f"data:application/pdf;base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
                
                return {
                    "url": data_url,
                    "name": "split.pdf",
                }
        
        except Exception as exc:
            logger.error(f"Combine/split PDF error: {exc}", exc_info=True)
            raise
    
    async def clean_noise(
        self,
        file_content: bytes,
        filename: str,
    ) -> Dict:
        """Clean noise from audio"""
        try:
            # Use noisereduce library
            try:
                import noisereduce as nr
                import soundfile as sf
                import io
                
                # Read audio
                audio_data, sample_rate = sf.read(io.BytesIO(file_content))
                
                # Reduce noise
                reduced_noise = nr.reduce_noise(y=audio_data, sr=sample_rate)
                
                # Save to buffer
                output_buffer = BytesIO()
                sf.write(output_buffer, reduced_noise, sample_rate, format='WAV')
                output_buffer.seek(0)
                
                data_url = f"data:audio/wav;base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
                
                return {
                    "url": data_url,
                    "name": filename.rsplit('.', 1)[0] + '_cleaned.wav',
                }
            except ImportError:
                # Fallback: return original
                data_url = f"data:audio/mpeg;base64,{base64.b64encode(file_content).decode()}"
                return {
                    "url": data_url,
                    "name": filename,
                }
        
        except Exception as exc:
            logger.error(f"Clean noise error: {exc}", exc_info=True)
            raise
    
    async def translate_document(
        self,
        file_content: bytes,
        filename: str,
        target_language: str = "en",
    ) -> Dict:
        """Translate document with multiple translation engines"""
        try:
            # Extract text from document
            text = file_content.decode('utf-8', errors='ignore')
            
            if not text or not text.strip():
                raise ValueError("Document is empty or contains no text")
            
            translated_text = text
            
            # Try multiple translation services
            # 1. Try deep-translator (more reliable)
            try:
                from deep_translator import GoogleTranslator
                translator = GoogleTranslator(source='auto', target=target_language)
                translated_text = translator.translate(text)
                logger.info(f"Translation successful using deep-translator to {target_language}")
            except Exception as e1:
                logger.warning(f"deep-translator failed: {e1}, trying googletrans...")
                
                # 2. Fallback to googletrans
                try:
                    from googletrans import Translator
                    translator = Translator()
                    translated = translator.translate(text, dest=target_language)
                    translated_text = translated.text
                    logger.info(f"Translation successful using googletrans to {target_language}")
                except Exception as e2:
                    logger.warning(f"googletrans failed: {e2}, trying translatepy...")
                    
                    # 3. Fallback to translatepy
                    try:
                        from translatepy import Translator
                        translator = Translator()
                        translated_text = translator.translate(text, target_language).result
                        logger.info(f"Translation successful using translatepy to {target_language}")
                    except Exception as e3:
                        logger.error(f"All translation services failed: {e1}, {e2}, {e3}")
                        # Return original text if all fail
                        translated_text = text
            
            # Convert to data URL
            text_bytes = translated_text.encode('utf-8')
            data_url = f"data:text/plain;base64,{base64.b64encode(text_bytes).decode()}"
            
            return {
                "url": data_url,
                "name": filename.rsplit('.', 1)[0] + f'_translated_{target_language}.txt',
            }
        
        except Exception as exc:
            logger.error(f"Translate document error: {exc}", exc_info=True)
            raise
    
    async def text_summarizer(
        self,
        text: str,
        length: str = "medium",
    ) -> Dict:
        """Summarize text"""
        try:
            import openai
            from backend.config import get_settings
            
            settings = get_settings()
            
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key not configured")
            
            # Use OpenAI for summarization
            max_tokens = {
                'short': 50,
                'medium': 100,
                'long': 200,
            }.get(length, 100)
            
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes text."},
                    {"role": "user", "content": f"Summarize this text in {length} length: {text}"}
                ],
                max_tokens=max_tokens,
            )
            
            summary = response.choices[0].message.content
            
            return {
                "summary": summary,
                "original_length": len(text),
                "summary_length": len(summary),
            }
        
        except Exception as exc:
            logger.error(f"Text summarizer error: {exc}", exc_info=True)
            raise
    
    async def grammar_checker(
        self,
        text: str,
    ) -> Dict:
        """Check grammar"""
        try:
            # Use LanguageTool or similar
            try:
                from language_tool_python import LanguageTool
                tool = LanguageTool('en-US')
                matches = tool.check(text)
                
                corrected_text = text
                for match in reversed(matches):
                    if match.replacements:
                        corrected_text = (
                            corrected_text[:match.offset] +
                            match.replacements[0] +
                            corrected_text[match.offset + match.errorLength:]
                        )
                
                return {
                    "original": text,
                    "corrected": corrected_text,
                    "errors": len(matches),
                }
            except ImportError:
                # Fallback: return original
                return {
                    "original": text,
                    "corrected": text,
                    "errors": 0,
                }
        
        except Exception as exc:
            logger.error(f"Grammar checker error: {exc}", exc_info=True)
            raise
    
    async def thumbnail_generator(
        self,
        file_content: bytes,
        filename: str,
        width: int = 200,
        height: int = 200,
    ) -> Dict:
        """Generate thumbnail"""
        try:
            # Open image
            image = Image.open(BytesIO(file_content))
            
            # Create thumbnail
            image.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Save to buffer
            output_buffer = BytesIO()
            image.save(output_buffer, format='PNG')
            output_buffer.seek(0)
            
            # Convert to data URL
            data_url = f"data:image/png;base64,{base64.b64encode(output_buffer.getvalue()).decode()}"
            
            result_name = filename.rsplit('.', 1)[0] + f'_thumb_{width}x{height}.png'
            
            return {
                "url": data_url,
                "name": result_name,
            }
        
        except Exception as exc:
            logger.error(f"Thumbnail generator error: {exc}", exc_info=True)
            raise
