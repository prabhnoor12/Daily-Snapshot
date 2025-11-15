
import time
from flask import request, jsonify, g, make_response
from functools import wraps
from collections import defaultdict
from middleware.logger import logger

# ADVANCED: Persistent storage with Redis
try:
    import redis
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
    USE_REDIS = True
except ImportError:
    redis_client = None
    USE_REDIS = False

# Configurable limits per endpoint
ENDPOINT_LIMITS = {
    # endpoint: (max_requests, window_seconds)
    'default': (100, 60),
    '/api/health': (10, 60),
    # Add more endpoints as needed
}

# Whitelisted IPs or users
WHITELIST_IPS = {'127.0.0.1'}
WHITELIST_USERS = {'admin'}

def get_user_id():
    # Example: get user ID from request context or headers
    return request.headers.get('X-User-ID') or 'anonymous'

def get_limit_for_endpoint(endpoint):
    return ENDPOINT_LIMITS.get(endpoint, ENDPOINT_LIMITS['default'])

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)

    def is_limited(self, key, max_requests, window_seconds):
        now = time.time()
        if USE_REDIS:
            # Redis-based rate limiting
            redis_key = f"rate:{key}"
            count = redis_client.zcount(redis_key, now - window_seconds, now)
            return count >= max_requests
        else:
            # In-memory fallback
            self.requests[key] = [t for t in self.requests[key] if now - t < window_seconds]
            return len(self.requests[key]) >= max_requests

    def add_request(self, key, window_seconds):
        now = time.time()
        if USE_REDIS:
            redis_key = f"rate:{key}"
            redis_client.zadd(redis_key, {now: now})
            redis_client.expire(redis_key, window_seconds)
        else:
            self.requests[key].append(now)

    def get_remaining(self, key, max_requests, window_seconds):
        now = time.time()
        if USE_REDIS:
            redis_key = f"rate:{key}"
            count = redis_client.zcount(redis_key, now - window_seconds, now)
            return max(0, max_requests - count)
        else:
            self.requests[key] = [t for t in self.requests[key] if now - t < window_seconds]
            return max(0, max_requests - len(self.requests[key]))

rate_limiter = RateLimiter()

def rate_limit_middleware(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        client_ip = request.remote_addr or 'unknown'
        endpoint = request.path or 'unknown'
        user_id = get_user_id()
        key = f"{user_id}:{client_ip}:{endpoint}"
        max_requests, window_seconds = get_limit_for_endpoint(endpoint)

        # Whitelist check
        if client_ip in WHITELIST_IPS or user_id in WHITELIST_USERS:
            return func(*args, **kwargs)

        if rate_limiter.is_limited(key, max_requests, window_seconds):
            remaining = rate_limiter.get_remaining(key, max_requests, window_seconds)
            logger.warning(
                "Rate limit exceeded",
                extra={
                    'extra': {
                        'request_id': request.headers.get('X-Request-ID'),
                        'ip': client_ip,
                        'endpoint': endpoint,
                        'user_id': user_id,
                        'remaining': remaining
                    }
                }
            )
            resp = make_response(jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429)
            resp.headers['X-RateLimit-Limit'] = str(max_requests)
            resp.headers['X-RateLimit-Remaining'] = str(remaining)
            resp.headers['X-RateLimit-Window'] = str(window_seconds)
            return resp
        rate_limiter.add_request(key, window_seconds)
        remaining = rate_limiter.get_remaining(key, max_requests, window_seconds)
        resp = func(*args, **kwargs)
        # Add rate limit headers to all responses
        if hasattr(resp, 'headers'):
            resp.headers['X-RateLimit-Limit'] = str(max_requests)
            resp.headers['X-RateLimit-Remaining'] = str(remaining)
            resp.headers['X-RateLimit-Window'] = str(window_seconds)
        return resp
    return wrapper

# Example usage:
# @app.route('/api/some-endpoint')
# @rate_limit_middleware
# def some_endpoint():
#     ...
