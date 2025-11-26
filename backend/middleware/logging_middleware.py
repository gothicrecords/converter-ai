"""
Logging middleware - Integrato con monitoring service
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging
import time

from backend.services.monitoring_service import get_monitor

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests con integrazione monitoring"""
    
    async def dispatch(self, request: Request, call_next):
        """Log request and response"""
        start_time = time.time()
        monitor = get_monitor()
        success = True
        
        # Log request
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else None,
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            # Non contare gli health check nelle metriche
            if not request.url.path.startswith("/health"):
                monitor.record_request(success=True)
        except Exception as exc:
            success = False
            logger.error(f"Request failed: {exc}", exc_info=True)
            if not request.url.path.startswith("/health"):
                monitor.record_request(success=False)
            raise
        
        # Log response
        process_time = time.time() - start_time
        
        # Log lento se > 1 secondo
        log_level = logging.WARNING if process_time > 1.0 else logging.INFO
        
        logger.log(
            log_level,
            f"{request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": process_time,
                "success": success,
            }
        )
        
        return response

