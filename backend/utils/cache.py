"""
Simple in-memory caching utility
For production, consider using Redis
"""
import time
import logging
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)


class CacheEntry:
    """Cache entry with expiration"""
    
    def __init__(self, value: Any, ttl: int):
        self.value = value
        self.created_at = time.time()
        self.ttl = ttl
        self.expires_at = self.created_at + ttl
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return time.time() > self.expires_at


class SimpleCache:
    """
    Simple in-memory cache with TTL support
    Thread-safe for basic operations
    """
    
    def __init__(self, default_ttl: int = 300):
        """
        Initialize cache
        
        Args:
            default_ttl: Default time-to-live in seconds (default: 5 minutes)
        """
        self._cache: Dict[str, CacheEntry] = {}
        self.default_ttl = default_ttl
        self._last_cleanup = time.time()
        self._cleanup_interval = 60  # Cleanup every minute
    
    def _cleanup_expired(self):
        """Remove expired entries"""
        current_time = time.time()
        if current_time - self._last_cleanup < self._cleanup_interval:
            return
        
        expired_keys = [
            key for key, entry in self._cache.items()
            if entry.is_expired()
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        self._last_cleanup = current_time
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        self._cleanup_expired()
        
        entry = self._cache.get(key)
        if entry is None:
            return None
        
        if entry.is_expired():
            del self._cache[key]
            return None
        
        return entry.value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache"""
        self._cleanup_expired()
        
        ttl = ttl or self.default_ttl
        self._cache[key] = CacheEntry(value, ttl)
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        self._cleanup_expired()
        return {
            "size": len(self._cache),
            "default_ttl": self.default_ttl,
        }


# Global cache instance
cache = SimpleCache(default_ttl=300)  # 5 minutes default


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time-to-live in seconds
        key_prefix: Prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            # Execute function and cache result
            logger.debug(f"Cache miss: {cache_key}")
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl=ttl)
            
            return result
        
        return wrapper
    return decorator

