"""
Error handler middleware
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback

logger = logging.getLogger(__name__)


async def error_handler(request: Request, exc: Exception):
    """Handle all exceptions"""
    
    # Handle HTTP exceptions
    if isinstance(exc, StarletteHTTPException):
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
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
            "status": 500,
            "message": str(exc) if logger.level <= logging.DEBUG else None,
        }
    )

