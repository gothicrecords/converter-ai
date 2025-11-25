"""
Users router - handles user operations
"""
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict
import logging

from backend.services.users_service import UsersService
from backend.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
users_service = UsersService()
auth_service = AuthService()


class UpdateStatsRequest(BaseModel):
    toolName: str


async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from session"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    session_token = authorization.replace("Bearer ", "")
    user = await auth_service.get_user_from_session(session_token)
    return user


@router.get("/stats")
async def get_stats(user: Optional[Dict] = Depends(get_current_user)):
    """Get user stats endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        stats = await users_service.get_stats(user["id"])
        return JSONResponse({
            "success": True,
            "stats": stats,
        })
    except Exception as exc:
        logger.error(f"Get stats error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/stats")
async def update_stats(
    request: UpdateStatsRequest,
    user: Optional[Dict] = Depends(get_current_user)
):
    """Update user stats endpoint"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        updated_user = await users_service.update_stats(user["id"], request.toolName)
        return JSONResponse({
            "success": True,
            "user": updated_user,
        })
    except Exception as exc:
        logger.error(f"Update stats error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))
