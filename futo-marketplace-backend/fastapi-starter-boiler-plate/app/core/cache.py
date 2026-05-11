import redis
import json
from app.core.config import settings

# Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def cache_get(key: str):
    """Get a value from cache. Returns None if not found."""
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except Exception:
        return None


def cache_set(key: str, value, ttl_seconds: int = 120):
    """Set a value in cache with TTL."""
    try:
        redis_client.setex(key, ttl_seconds, json.dumps(value, default=str))
    except Exception:
        pass  # Never crash the app if Redis is unavailable


def cache_delete(key: str):
    """Delete a key from cache."""
    try:
        redis_client.delete(key)
    except Exception:
        pass


def cache_delete_pattern(pattern: str):
    """Delete all keys matching a pattern e.g. 'items:*'"""
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass