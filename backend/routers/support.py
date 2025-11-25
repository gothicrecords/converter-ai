"""
Support router - handles support chat
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging

from backend.services.support_service import SupportService

logger = logging.getLogger(__name__)

router = APIRouter()
support_service = SupportService()


class SupportChatRequest(BaseModel):
    message: str
    context: Optional[List[Dict]] = None
    conversationHistory: Optional[List[Dict]] = None


@router.post("/chat")
async def support_chat(request: SupportChatRequest):
    """Support chat endpoint"""
    try:
        result = await support_service.chat(
            message=request.message,
            context=request.context,
            conversation_history=request.conversationHistory
        )
        return JSONResponse({
            "success": True,
            "answer": result["answer"],
        })
    except Exception as exc:
        logger.error(f"Support chat error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
