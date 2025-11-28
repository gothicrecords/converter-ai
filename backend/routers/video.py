"""
Video router - handles video format conversion
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
        
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"Video conversion processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Video conversion error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
