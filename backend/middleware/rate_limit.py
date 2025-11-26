"""
Rate limiting middleware
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from typing import Dict, Tuple
import time
from collections import defaultdict
from datetime import datetime, timedelta
import logging

from backend.utils.exceptions import RateLimitException
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware
    For production, consider using Redis-based rate limiting
    """
    
    def __init__(self, app, default_limit: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        # Store: {client_ip: [(timestamp, count), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        # Cleanup old entries periodically
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 minutes
    
    def _get_client_id(self, request: Request) -> str:
        """Get client identifier (IP address)"""
        # Check for forwarded IP (from proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        # Fallback to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _cleanup_old_entries(self):
        """Remove old rate limit entries"""
        current_time = time.time()
        cutoff_time = current_time - (self.window_seconds * 2)  # Keep 2x window
        
        for client_id in list(self.requests.keys()):
            self.requests[client_id] = [
                (ts, count) for ts, count in self.requests[client_id]
                if ts > cutoff_time
            ]
            # Remove empty entries
            if not self.requests[client_id]:
                del self.requests[client_id]
    
    def _check_rate_limit(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if client has exceeded rate limit
        Returns: (is_allowed, retry_after_seconds)
        """
        current_time = time.time()
        window_start = current_time - self.window_seconds
        
        # Clean up old entries periodically
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries()
            self.last_cleanup = current_time
        
        # Filter requests within the current window
        recent_requests = [
            ts for ts, _ in self.requests[client_id]
            if ts > window_start
        ]
        
        request_count = len(recent_requests)
        
        # Check if limit exceeded
        if request_count >= self.default_limit:
            # Calculate retry after (time until oldest request expires)
            oldest_request = min(recent_requests)
            retry_after = int(self.window_seconds - (current_time - oldest_request)) + 1
            return False, retry_after
        
        # Add current request
        self.requests[client_id].append((current_time, 1))
        
        return True, 0
    
    async def dispatch(self, request: Request, call_next):
        """Check rate limit before processing request"""
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/api/health"]:
            return await call_next(request)
        
        client_id = self._get_client_id(request)
        is_allowed, retry_after = self._check_rate_limit(client_id)
        
        if not is_allowed:
            logger.warning(
                f"Rate limit exceeded for {client_id}",
                extra={
                    "client_id": client_id,
                    "path": request.url.path,
                    "retry_after": retry_after,
                }
            )
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "status": 429,
                    "details": {
                        "retry_after": retry_after,
                        "limit": self.default_limit,
                        "window_seconds": self.window_seconds,
                    }
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.default_limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                }
            )
        
        # Add rate limit headers
        response = await call_next(request)
        remaining = max(0, self.default_limit - len([
            ts for ts, _ in self.requests[client_id]
            if ts > time.time() - self.window_seconds
        ]))
        
        response.headers["X-RateLimit-Limit"] = str(self.default_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + self.window_seconds)
        
        return response

