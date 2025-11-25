"""
Upscale router - handles image upscaling
Simple router that delegates to tools service
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging

from backend.services.tools_service import ToolsService

logger = logging.getLogger(__name__)

router = APIRouter()
tools_service = ToolsService()


@router.post("/upscale")
async def upscale(file: UploadFile = File(...), scale: int = Form(2)):
    """Upscale image - delegates to tools service"""
    try:
        file_content = await file.read()
        result = await tools_service.upscale(file_content, file.filename or "file.jpg", scale)
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"Upscale error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))

