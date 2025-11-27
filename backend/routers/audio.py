"""
Audio router - handles audio format conversion
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
async def convert_audio(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    abitrate: Optional[str] = Form(None),
):
    """Convert audio file to target format (mp3, wav, flac, ogg, m4a, aac, weba, opus)"""
    try:
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
        
        result = await tools_service.convert_audio(
            file_content, 
            file.filename or "audio", 
            target_format,
            abitrate=abitrate
        )
        
        # Ensure consistent response format
        return JSONResponse({
            "name": result.get("name", "converted_audio"),
            "dataUrl": result.get("url") or result.get("dataUrl")
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Audio conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
