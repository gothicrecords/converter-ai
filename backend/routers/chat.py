"""
Chat router
"""
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/message")
async def send_message():
    """Send message endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/upload-document")
async def upload_document():
    """Upload document endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")

