"""
Files router - handles file operations
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Header, Depends
from fastapi.responses import JSONResponse
from typing import Optional, Dict
import logging

from backend.services.files_service import FilesService
from backend.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
files_service = FilesService()
auth_service = AuthService()


async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from session"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    session_token = authorization.replace("Bearer ", "")
    user = await auth_service.get_user_from_session(session_token)
    return user


@router.get("/list")
async def list_files(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    fileType: Optional[str] = Query(None),
    user: Optional[Dict] = Depends(get_current_user)
):
    """List files endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        result = await files_service.list_files(
            user_id=user["id"],
            page=page,
            limit=limit,
            search=search,
            file_type=fileType
        )
        return JSONResponse({
            "success": True,
            "files": result["files"],
            "pagination": result["pagination"],
        })
    except Exception as exc:
        logger.error(f"List files error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    user: Optional[Dict] = Depends(get_current_user)
):
    """Get file endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        file_data = await files_service.get_file(file_id, user["id"])
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        return JSONResponse({
            "success": True,
            "file": file_data,
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Get file error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: Optional[Dict] = Depends(get_current_user)
):
    """Upload file endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        file_content = await file.read()
        result = await files_service.upload_file(
            file_content=file_content,
            filename=file.filename or "file",
            user_id=user["id"],
            original_filename=file.filename
        )
        return JSONResponse({
            "success": True,
            "file": result,
        })
    except Exception as exc:
        logger.error(f"Upload file error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
