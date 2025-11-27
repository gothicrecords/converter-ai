"""
OAuth router - handles OAuth authentication (Google, Facebook)
"""
from fastapi import APIRouter, HTTPException, Query, Cookie
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Optional
import logging
import secrets
from urllib.parse import urlencode

from backend.config import get_settings

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False
    httpx = None
from backend.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()
auth_service = AuthService()
settings = get_settings()


@router.get("/google")
async def google_oauth_initiate():
    """Initiate Google OAuth flow"""
    try:
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
        # Generate state token for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Build redirect URI
        redirect_uri = f"{settings.APP_URL}/api/auth/oauth/google/callback"
        
        # Google OAuth 2.0 authorization URL
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'offline',
            'prompt': 'consent',
        }
        
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        
        # Return redirect with state in cookie
        response = RedirectResponse(url=auth_url, status_code=302)
        response.set_cookie(
            key="oauth_state",
            value=state,
            httponly=True,
            samesite="lax",
            max_age=600,  # 10 minutes
            path="/"
        )
        return response
    except Exception as exc:
        logger.error(f"Google OAuth initiation error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to initiate OAuth")


@router.get("/google/callback")
async def google_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    oauth_state: Optional[str] = Cookie(None)
):
    """Handle Google OAuth callback"""
    try:
        # Check for errors from Google
        if error:
            logger.error(f"Google OAuth error: {error}")
            return RedirectResponse(url=f"/login?error={error}", status_code=302)
        
        if not code or not state:
            logger.error("Missing code or state in OAuth callback")
            return RedirectResponse(url="/login?error=Invalid OAuth response", status_code=302)
        
        # Verify state token (CSRF protection)
        if not oauth_state or oauth_state != state:
            logger.error(f"Invalid state token: {oauth_state} != {state}")
            return RedirectResponse(url="/login?error=Invalid state token", status_code=302)
        
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            logger.error("Google OAuth not configured")
            return RedirectResponse(url="/login?error=OAuth not configured", status_code=302)
        
        redirect_uri = f"{settings.APP_URL}/api/auth/oauth/google/callback"
        
        # Exchange authorization code for access token
        if not HTTPX_AVAILABLE:
            raise HTTPException(status_code=500, detail="httpx not available")
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if not token_response.is_success:
                error_data = token_response.json() if token_response.headers.get("content-type") == "application/json" else {}
                logger.error(f"Google token exchange error: {error_data}")
                return RedirectResponse(url="/login?error=Failed to exchange token", status_code=302)
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                logger.error(f"No access token in response: {token_data}")
                return RedirectResponse(url="/login?error=No access token received", status_code=302)
            
            # Get user info from Google
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if not user_info_response.is_success:
                logger.error(f"Google user info error: {user_info_response.text}")
                return RedirectResponse(url="/login?error=Failed to get user info", status_code=302)
            
            user_info = user_info_response.json()
            provider_id = str(user_info.get("id"))
            email = user_info.get("email")
            name = user_info.get("name") or email.split("@")[0] if email else "User"
            avatar_url = user_info.get("picture")
            
            if not email:
                logger.error(f"No email in user info: {user_info}")
                return RedirectResponse(url="/login?error=Email not provided by Google", status_code=302)
            
            if not provider_id:
                logger.error(f"No provider ID in user info: {user_info}")
                return RedirectResponse(url="/login?error=User ID not provided by Google", status_code=302)
            
            # Register or login user
            result = await auth_service.register_or_login_oauth_user(
                provider="google",
                provider_id=provider_id,
                email=email,
                name=name,
                avatar_url=avatar_url
            )
            
            if not result or not result.get("user"):
                logger.error("Invalid result from register_or_login_oauth_user")
                return RedirectResponse(url="/login?error=Failed to authenticate", status_code=302)
            
            session_token = result.get("sessionToken")
            if not session_token:
                logger.error("No session token in result")
                return RedirectResponse(url="/login?error=Failed to create session", status_code=302)
            
            # Redirect to dashboard with session cookie
            response = RedirectResponse(url="/dashboard?welcome=true", status_code=302)
            response.set_cookie(
                key="megapixelai_session",
                value=session_token,
                httponly=True,
                samesite="lax",
                max_age=7 * 24 * 60 * 60,  # 7 days
                path="/"
            )
            # Clear OAuth state cookie
            response.delete_cookie(key="oauth_state", path="/")
            return response
            
    except Exception as exc:
        logger.error(f"Google OAuth callback error: {exc}", exc_info=True)
        return RedirectResponse(url="/login?error=Authentication error", status_code=302)

