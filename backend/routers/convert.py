"""
Convert router - handles file conversions
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from backend.services.converter import ConverterService

logger = logging.getLogger(__name__)

router = APIRouter()
converter_service = ConverterService()


@router.post("/{target_format}")
async def convert_file(
    target_format: str,
    file: UploadFile = File(...),
    quality: Optional[str] = Form(None),
    width: Optional[str] = Form(None),
    height: Optional[str] = Form(None),
    page: Optional[str] = Form(None),
    vwidth: Optional[str] = Form(None),
    vheight: Optional[str] = Form(None),
    vbitrate: Optional[str] = Form(None),
    abitrate: Optional[str] = Form(None),
):
    """
    Convert a file to target format
    
    Args:
        target_format: Target format (e.g., 'jpg', 'png', 'pdf')
        file: File to convert
        quality: Quality setting (optional)
        width: Width setting (optional)
        height: Height setting (optional)
        page: Page number for PDFs (optional)
    
    Returns:
        JSON response with converted file data URL
    """
    try:
        # Read file content
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="File is empty. Please upload a valid file."
            )
        
        # Get original filename
        original_filename = file.filename or "file"
        
        # Convert file
        page_int = int(page) if page else None
        result = await converter_service.convert(
            file_content=file_content,
            original_filename=original_filename,
            target_format=target_format,
            quality=quality,
            width=width,
            height=height,
            page=page_int,
            vwidth=vwidth,
            vheight=vheight,
            vbitrate=vbitrate,
            abitrate=abitrate,
        )
        
        return JSONResponse({
            "name": result["name"],
            "dataUrl": result["data_url"],
        })
    
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Conversion error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed: {str(exc)}"
        )

