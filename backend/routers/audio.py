"""
Audio router - handles audio format conversion
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging
from backend.services.tools_service import ToolsService

logger = logging.getLogger(__name__)
router = APIRouter()
tools_service = ToolsService()

@router.post("/convert")
async def convert_audio(
    file: UploadFile = File(...),
    target_format: str = Form(...)
):
    """Convert audio file to target format (mp3, wav, flac, ogg, m4a, aac)"""
    try:
        file_content = await file.read()
        result = await tools_service.convert_audio(file_content, file.filename or "audio", target_format)
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"Audio conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
