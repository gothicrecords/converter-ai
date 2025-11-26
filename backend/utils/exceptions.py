"""
Custom exception classes for the application
Provides consistent error handling across the API
"""
from typing import Optional, Dict, Any
from fastapi import status


class AppException(Exception):
    """Base exception class for the application"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        original_error: Optional[Exception] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__.upper()
        self.details = details or {}
        self.original_error = original_error
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for JSON response"""
        return {
            "error": self.message,
            "code": self.error_code,
            "status": self.status_code,
            "details": self.details if self.details else None,
        }


class ValidationException(AppException):
    """Validation error (400)"""
    
    def __init__(self, message: str = "Validation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="VALIDATION_ERROR",
            details=details
        )


class AuthenticationException(AppException):
    """Authentication error (401)"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTHENTICATION_ERROR"
        )


class AuthorizationException(AppException):
    """Authorization error (403)"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="AUTHORIZATION_ERROR"
        )


class NotFoundException(AppException):
    """Resource not found error (404)"""
    
    def __init__(self, resource: str = "Resource", resource_id: Optional[str] = None):
        message = f"{resource} not found"
        if resource_id:
            message += f": {resource_id}"
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details={"resource": resource, "resource_id": resource_id}
        )


class ConflictException(AppException):
    """Conflict error (409)"""
    
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_code="CONFLICT"
        )


class RateLimitException(AppException):
    """Rate limit exceeded error (429)"""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: Optional[int] = None):
        details = {"retry_after": retry_after} if retry_after else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            details=details
        )


class DatabaseException(AppException):
    """Database error (500)"""
    
    def __init__(self, message: str = "Database error", original_error: Optional[Exception] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
            original_error=original_error
        )


class FileSystemException(AppException):
    """File system error (500)"""
    
    def __init__(self, message: str = "File system error", original_error: Optional[Exception] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="FILE_SYSTEM_ERROR",
            original_error=original_error
        )


class ProcessingException(AppException):
    """Processing error (500)"""
    
    def __init__(self, message: str = "Processing error", original_error: Optional[Exception] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="PROCESSING_ERROR",
            original_error=original_error
        )


class TimeoutException(AppException):
    """Timeout error (408)"""
    
    def __init__(self, message: str = "Request timeout", timeout: Optional[int] = None):
        details = {"timeout": timeout} if timeout else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            error_code="TIMEOUT_ERROR",
            details=details
        )


class FileTooLargeException(AppException):
    """File too large error (413)"""
    
    def __init__(self, max_size: Optional[int] = None):
        message = "File too large"
        details = {"max_size": max_size} if max_size else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            error_code="FILE_TOO_LARGE",
            details=details
        )

