"""
Support router
"""
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat")
async def support_chat():
    """Support chat endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")

