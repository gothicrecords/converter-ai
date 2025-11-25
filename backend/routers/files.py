"""
Files router
"""
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/list")
async def list_files():
    """List files endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{file_id}")
async def get_file(file_id: str):
    """Get file endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/upload")
async def upload_file():
    """Upload file endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")

