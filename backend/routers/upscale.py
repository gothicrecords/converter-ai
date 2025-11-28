"""
Upscale router - handles image upscaling
Simple router that delegates to tools service
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging

from backend.services.tools_service import ToolsService
from backend.utils.response_validator import validate_response
from backend.utils.exceptions import ProcessingException

logger = logging.getLogger(__name__)

router = APIRouter()
tools_service = ToolsService()


@router.post("/upscale")
async def upscale(
    image: UploadFile = File(...), 
    scale: int = Form(default=2)
):
    """Upscale image - delegates to tools service"""
    try:
        file_content = await image.read()
        result = await tools_service.upscale(file_content, image.filename or "file.jpg", scale)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Upscale processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Upscale error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))

