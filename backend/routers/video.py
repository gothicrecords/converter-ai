"""
Video router - handles video format conversion
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging
from backend.services.tools_service import ToolsService

logger = logging.getLogger(__name__)
router = APIRouter()
tools_service = ToolsService()

@router.post("/convert")
async def convert_video(
    file: UploadFile = File(...),
    target_format: str = Form(...)
):
    """Convert video file to target format (mp4, avi, mov, webm, mkv, flv)"""
    try:
        file_content = await file.read()
        result = await tools_service.convert_video(file_content, file.filename or "video", target_format)
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"Video conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
