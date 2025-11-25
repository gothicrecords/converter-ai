"""
Auth router - handles authentication
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from backend.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
auth_service = AuthService()


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def signup(request: SignupRequest):
    """Signup endpoint"""
    try:
        result = await auth_service.register_user(
            name=request.name,
            email=request.email,
            password=request.password
        )
        return JSONResponse({
            "success": True,
            "user": result["user"],
            "sessionToken": result["sessionToken"],
        }, status_code=201)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as exc:
        logger.error(f"Signup error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Signup failed")


@router.post("/login")
async def login(request: LoginRequest):
    """Login endpoint"""
    try:
        result = await auth_service.authenticate_user(
            email=request.email,
            password=request.password
        )
        return JSONResponse({
            "success": True,
            "user": result["user"],
            "sessionToken": result["sessionToken"],
        })
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as exc:
        logger.error(f"Login error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Logout endpoint"""
    try:
        session_token = None
        if authorization and authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
        
        if not session_token:
            raise HTTPException(status_code=401, detail="No session token provided")
        
        await auth_service.logout(session_token)
        return JSONResponse({"success": True})
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Logout error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/session")
async def get_session(authorization: Optional[str] = Header(None)):
    """Get session endpoint"""
    try:
        session_token = None
        if authorization and authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
        
        if not session_token:
            raise HTTPException(status_code=401, detail="No session token provided")
        
        user = await auth_service.get_user_from_session(session_token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        
        return JSONResponse({
            "success": True,
            "user": user,
        })
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Get session error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Get session failed")
