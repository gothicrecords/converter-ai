"""
Auth router - handles authentication
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Cookie
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from backend.services.auth_service import AuthService
from backend.utils.exceptions import (
    ValidationException,
    AuthenticationException,
    ConflictException,
    DatabaseException,
)

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
        
        # Create response with session cookie for web clients
        response = JSONResponse({
            "success": True,
            "user": result["user"],
            "sessionToken": result["sessionToken"],
        }, status_code=201)
        
        # Set session cookie for browser-based clients
        response.set_cookie(
            key="megapixelai_session",
            value=result["sessionToken"],
            httponly=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        return response
    except (ValidationException, ConflictException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except DatabaseException as e:
        logger.error(f"Signup database error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Signup failed")
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
        
        # Create response with session cookie for web clients
        response = JSONResponse({
            "success": True,
            "user": result["user"],
            "sessionToken": result["sessionToken"],
        })
        
        # Set session cookie for browser-based clients
        response.set_cookie(
            key="megapixelai_session",
            value=result["sessionToken"],
            httponly=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        return response
    except (ValidationException, AuthenticationException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except DatabaseException as e:
        logger.error(f"Login database error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Login failed")
    except Exception as exc:
        logger.error(f"Login error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/logout")
async def logout(
    authorization: Optional[str] = Header(None),
    cookie_session: Optional[str] = Cookie(None, alias="megapixelai_session")
):
    """Logout endpoint"""
    try:
        session_token = None
        
        # Try getting token from header
        if authorization and authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
        
        # Try getting token from cookie if not in header
        if not session_token and cookie_session:
            session_token = cookie_session
        
        if not session_token:
            # If no token found, just return success (idempotent)
            response = JSONResponse({"success": True})
            response.delete_cookie(key="megapixelai_session", path="/")
            return response
        
        await auth_service.logout(session_token)
        
        # Return response that clears cookie
        response = JSONResponse({"success": True})
        response.delete_cookie(key="megapixelai_session", path="/")
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Logout error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/session")
async def get_session(
    authorization: Optional[str] = Header(None),
    cookie_session: Optional[str] = Cookie(None, alias="megapixelai_session")
):
    """Get session endpoint"""
    try:
        session_token = None
        
        # Try getting token from header
        if authorization and authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
        
        # Try getting token from cookie if not in header
        if not session_token and cookie_session:
            session_token = cookie_session
        
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
