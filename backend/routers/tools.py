"""
Tools router - handles AI tools
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


@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    type: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    crop: Optional[str] = Form(None),
    cropMargin: Optional[str] = Form(None),
):
    """Remove background from image with advanced edge refinement"""
    try:
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
        
        result = await tools_service.remove_background(
            file_content, file.filename or "file.jpg", type, size, crop, cropMargin
        )
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"Remove background processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Remove background error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/upscale")
async def upscale(image: UploadFile = File(...), scale: int = Form(default=2)):
    """Upscale image"""
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


@router.post("/compress-video")
async def compress_video(file: UploadFile = File(...), quality: str = "medium"):
    """Compress video"""
    try:
        file_content = await file.read()
        result = await tools_service.compress_video(file_content, file.filename or "file.mp4", quality)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Compress video processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Compress video error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/transcribe-audio")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio to text"""
    try:
        file_content = await file.read()
        result = await tools_service.transcribe_audio(file_content, file.filename or "file.mp3")
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="json", required_fields=["text"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Transcribe audio processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Transcribe audio error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/ocr-advanced")
async def ocr_advanced(file: UploadFile = File(...)):
    """Advanced OCR"""
    try:
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
        
        result = await tools_service.ocr_advanced(file_content, file.filename or "file.jpg")
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="json", required_fields=["text"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"OCR processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"OCR error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/generate-image")
async def generate_image(
    prompt: str = Form(...),
    style: Optional[str] = Form(None),
    aspect: Optional[str] = Form("1:1"),
    quality: Optional[str] = Form("standard"),
):
    """Generate image from prompt"""
    try:
        result = await tools_service.generate_image(prompt, style, aspect, quality)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="url", required_fields=["url"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Generate image processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Generate image error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/combine-split-pdf")
async def combine_split_pdf(
    files: list[UploadFile] = File(...),
    mode: str = Form("combine"),
    ranges: str = Form(None),
):
    """Combine or split PDF files"""
    try:
        file_contents = []
        for file in files:
            content = await file.read()
            if not content or len(content) == 0:
                raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
            file_contents.append((content, file.filename or "file.pdf"))
        
        result = await tools_service.combine_split_pdf(file_contents, mode, ranges)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"Combine/split PDF processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Combine/split PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/clean-noise")
async def clean_noise(file: UploadFile = File(...)):
    """Clean noise from audio"""
    try:
        file_content = await file.read()
        result = await tools_service.clean_noise(file_content, file.filename or "file.mp3")
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Clean noise processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Clean noise error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/translate-document")
async def translate_document(
    file: UploadFile = File(...),
    target_language: str = Form("en"),
):
    """Translate document"""
    try:
        file_content = await file.read()
        
        if not file_content or len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty. Please upload a valid file.")
        
        result = await tools_service.translate_document(
            file_content, file.filename or "file.txt", target_language
        )
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except HTTPException:
        raise
    except ProcessingException as exc:
        logger.error(f"Translate document processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Translate document error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/text-summarizer")
async def text_summarizer(text: str = Form(...), length: str = Form("medium")):
    """Summarize text"""
    try:
        result = await tools_service.text_summarizer(text, length)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="json", required_fields=["summary"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Text summarizer processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Text summarizer error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/grammar-checker")
async def grammar_checker(text: str = Form(...)):
    """Check grammar"""
    try:
        result = await tools_service.grammar_checker(text)
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="json", required_fields=["corrected"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Grammar checker processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Grammar checker error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/thumbnail-generator")
async def thumbnail_generator(
    file: UploadFile = File(...),
    width: int = Form(200),
    height: int = Form(200),
):
    """Generate thumbnail"""
    try:
        file_content = await file.read()
        result = await tools_service.thumbnail_generator(
            file_content, file.filename or "file.jpg", width, height
        )
        # Valida sempre la risposta prima di restituirla
        validated = validate_response(result, response_type="dataUrl", required_fields=["url"])
        return JSONResponse(validated)
    except ProcessingException as exc:
        logger.error(f"Thumbnail generator processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Thumbnail generator error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))




@router.post("/convert-audio")
async def convert_audio(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    abitrate: Optional[str] = Form(None),
):
    """Convert audio file to target format"""
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
        logger.error(f"Convert audio processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Convert audio error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/convert-video")
async def convert_video(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    vwidth: Optional[str] = Form(None),
    vheight: Optional[str] = Form(None),
    vbitrate: Optional[str] = Form(None),
    abitrate: Optional[str] = Form(None),
):
    """Convert video file to target format"""
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
        logger.error(f"Convert video processing error: {exc}", exc_info=True)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except Exception as exc:
        logger.error(f"Convert video error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
