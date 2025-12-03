"""
Rate limiting utilities (Upstash Redis compatible)
"""
import redis
from typing import Optional
from fastapi import HTTPException, Request
from app.config import settings
import logging

logger = logging.getLogger(__name__)

redis_client: Optional[redis.Redis] = None


def init_redis():
    """Initialize Redis client for rate limiting"""
    global redis_client
    if settings.REDIS_URL:
        try:
            # Strip any whitespace from URL
            redis_url = settings.REDIS_URL.strip()
            # For Upstash TLS connections, rediss:// scheme handles SSL automatically
            redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection with retry
            redis_client.ping()
            logger.info("Redis connected for rate limiting")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Rate limiting disabled.")
            logger.debug(f"Redis URL (first 50 chars): {settings.REDIS_URL[:50] if settings.REDIS_URL else 'None'}...")
            redis_client = None
    else:
        logger.info("Redis URL not configured. Rate limiting disabled.")


def check_rate_limit(identifier: str, limit: int = None, window: int = 60) -> bool:
    """
    Check if request is within rate limit
    
    Args:
        identifier: Unique identifier (IP address, API key, etc.)
        limit: Maximum requests per window (defaults to settings)
        window: Time window in seconds (default 60)
        
    Returns:
        True if within limit, False if rate limited
    """
    if redis_client is None:
        return True  # No rate limiting if Redis not available
    
    if limit is None:
        limit = settings.RATE_LIMIT_PER_MINUTE
    
    try:
        key = f"rate_limit:{identifier}"
        current = redis_client.get(key)
        
        if current is None:
            # First request in window
            redis_client.setex(key, window, 1)
            return True
        
        current_count = int(current)
        if current_count >= limit:
            return False
        
        # Increment counter
        redis_client.incr(key)
        return True
        
    except Exception as e:
        logger.error(f"Rate limit check failed: {e}")
        return True  # Fail open - allow request if rate limiting fails


async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Get identifier (IP address)
    identifier = request.client.host if request.client else "unknown"
    
    if not check_rate_limit(identifier):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )
    
    response = await call_next(request)
    return response

