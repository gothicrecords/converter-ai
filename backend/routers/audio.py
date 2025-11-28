"""
Audio router - handles audio format conversion
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import logging
from backend.services.tools_service import ToolsService
from backend.utils.response_validator import validate_response
from backend.utils.exceptions import ProcessingException

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
        
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"Audio conversion processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Audio conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
