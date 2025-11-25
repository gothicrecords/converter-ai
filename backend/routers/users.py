"""
Users router
"""
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats")
async def get_stats():
    """Get user stats endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")

