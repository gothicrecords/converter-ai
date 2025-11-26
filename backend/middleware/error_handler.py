"""
Error handler middleware
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
from typing import Dict, Any

from backend.utils.exceptions import AppException

logger = logging.getLogger(__name__)


async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all exceptions with improved error responses"""
    
    # Handle custom application exceptions
    if isinstance(exc, AppException):
        logger.warning(
            f"Application error: {exc.error_code} - {exc.message}",
            extra={
                "error_code": exc.error_code,
                "status_code": exc.status_code,
                "path": request.url.path,
                "method": request.method,
                "details": exc.details,
            }
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict()
        )
    
    # Handle HTTP exceptions
    if isinstance(exc, StarletteHTTPException):
        logger.warning(
            f"HTTP error: {exc.status_code} - {exc.detail}",
            extra={
                "status_code": exc.status_code,
                "path": request.url.path,
                "method": request.method,
            }
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "code": f"HTTP_{exc.status_code}",
                "status": exc.status_code,
            }
        )
    
    # Handle validation errors
    if isinstance(exc, RequestValidationError):
        errors = exc.errors()
        logger.warning(
            f"Validation error: {len(errors)} errors",
            extra={
                "path": request.url.path,
                "method": request.method,
                "errors": errors,
            }
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Validation error",
                "details": errors,
                "code": "VALIDATION_ERROR",
                "status": 422,
            }
        )
    
    # Handle unknown errors
    error_id = id(exc)  # Simple error ID for tracking
    logger.error(
        f"Unhandled error [{error_id}]: {exc}",
        exc_info=True,
        extra={
            "error_id": error_id,
            "path": request.url.path,
            "method": request.method,
            "client": request.client.host if request.client else None,
        }
    )
    
    # In production, don't expose internal error details
    is_debug = logger.level <= logging.DEBUG
    content: Dict[str, Any] = {
        "error": "Internal server error",
        "code": "INTERNAL_ERROR",
        "status": 500,
        "error_id": str(error_id),  # For support/debugging
    }
    
    if is_debug:
        content["message"] = str(exc)
        content["traceback"] = traceback.format_exc()
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content
    )

