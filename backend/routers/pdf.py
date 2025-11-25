"""
PDF router - handles PDF conversions
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import logging

from backend.services.pdf_converter import PDFConverterService

logger = logging.getLogger(__name__)

router = APIRouter()
pdf_service = PDFConverterService()


@router.post("/pdf-to-docx")
async def pdf_to_docx(file: UploadFile = File(...)):
    """Convert PDF to DOCX"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_docx(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to DOCX error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-pptx")
async def pdf_to_pptx(file: UploadFile = File(...)):
    """Convert PDF to PPTX"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_pptx(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to PPTX error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-xlsx")
async def pdf_to_xlsx(file: UploadFile = File(...)):
    """Convert PDF to XLSX"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_xlsx(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to XLSX error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-jpg")
async def pdf_to_jpg(file: UploadFile = File(...), page: int = Form(0)):
    """Convert PDF to JPG"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_jpg(file_content, file.filename or "file.pdf", page)
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to JPG error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-txt")
async def pdf_to_txt(file: UploadFile = File(...)):
    """Convert PDF to TXT"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_txt(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to TXT error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-html")
async def pdf_to_html(file: UploadFile = File(...)):
    """Convert PDF to HTML"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_html(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to HTML error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/pdf-to-pdfa")
async def pdf_to_pdfa(file: UploadFile = File(...)):
    """Convert PDF to PDF/A"""
    try:
        file_content = await file.read()
        result = await pdf_service.pdf_to_pdfa(file_content, file.filename or "file.pdf")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PDF to PDF/A error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/docx-to-pdf")
async def docx_to_pdf(file: UploadFile = File(...)):
    """Convert DOCX to PDF"""
    try:
        file_content = await file.read()
        result = await pdf_service.docx_to_pdf(file_content, file.filename or "file.docx")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"DOCX to PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/ppt-to-pdf")
async def ppt_to_pdf(file: UploadFile = File(...)):
    """Convert PPT/PPTX to PDF"""
    try:
        file_content = await file.read()
        result = await pdf_service.ppt_to_pdf(file_content, file.filename or "file.pptx")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"PPT to PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/xls-to-pdf")
async def xls_to_pdf(file: UploadFile = File(...)):
    """Convert XLS/XLSX to PDF"""
    try:
        file_content = await file.read()
        result = await pdf_service.xls_to_pdf(file_content, file.filename or "file.xlsx")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"XLS to PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/html-to-pdf")
async def html_to_pdf(file: UploadFile = File(...)):
    """Convert HTML to PDF"""
    try:
        file_content = await file.read()
        result = await pdf_service.html_to_pdf(file_content, file.filename or "file.html")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"HTML to PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/jpg-to-pdf")
async def jpg_to_pdf(file: UploadFile = File(...)):
    """Convert JPG/PNG to PDF"""
    try:
        file_content = await file.read()
        result = await pdf_service.jpg_to_pdf(file_content, file.filename or "file.jpg")
        return JSONResponse(result)
    except Exception as exc:
        logger.error(f"JPG to PDF error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))

