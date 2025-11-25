"""
Chat router - handles AI chat
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Header, Depends, Depends, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging

from backend.services.chat_service import ChatService
from backend.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
chat_service = ChatService()
auth_service = AuthService()


class ChatMessageRequest(BaseModel):
    message: str
    fileIds: Optional[List[str]] = None
    conversationHistory: Optional[List[Dict]] = None


async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from session"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    session_token = authorization.replace("Bearer ", "")
    user = await auth_service.get_user_from_session(session_token)
    return user


@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    user: Optional[Dict] = Depends(get_current_user)
):
    """Send message endpoint"""
    try:
        result = await chat_service.send_message(
            message=request.message,
            file_ids=request.fileIds,
            conversation_history=request.conversationHistory
        )
        return JSONResponse({
            "success": True,
            "answer": result["answer"],
            "sources": result.get("sources", []),
        })
    except Exception as exc:
        logger.error(f"Send message error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user: Optional[Dict] = Depends(get_current_user)
):
    """Upload document endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        file_content = await file.read()
        result = await chat_service.upload_document(
            file_content=file_content,
            filename=file.filename or "file",
            user_id=user["id"]
        )
        return JSONResponse({
            "success": True,
            "fileId": result["fileId"],
        })
    except Exception as exc:
        logger.error(f"Upload document error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
