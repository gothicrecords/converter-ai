"""
Video router - handles video format conversion
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import logging
from backend.services.tools_service import ToolsService

logger = logging.getLogger(__name__)
router = APIRouter()
tools_service = ToolsService()

@router.post("/convert")
async def convert_video(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    vwidth: Optional[str] = Form(None),
    vheight: Optional[str] = Form(None),
    vbitrate: Optional[str] = Form(None),
    abitrate: Optional[str] = Form(None),
):
    """Convert video file to target format (mp4, avi, mov, webm, mkv, flv)"""
    try:
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
        
        result = await tools_service.convert_video(
            file_content, 
            file.filename or "video", 
            target_format,
            vwidth=vwidth,
            vheight=vheight,
            vbitrate=vbitrate,
            abitrate=abitrate
        )
        
        # Ensure consistent response format
        return JSONResponse({
            "name": result.get("name", "converted_video"),
            "dataUrl": result.get("url") or result.get("dataUrl")
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Video conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
