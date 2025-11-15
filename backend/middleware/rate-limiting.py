import time
from flask import request, jsonify, g
from functools import wraps
from collections import defaultdict
from middleware.logger import logger

# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_limited(self, key):
        now = time.time()
        # Remove old requests
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window_seconds]
        return len(self.requests[key]) >= self.max_requests

    def add_request(self, key):
        self.requests[key].append(time.time())

rate_limiter = RateLimiter()

# Flask middleware/decorator for rate limiting

def rate_limit_middleware(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        client_ip = request.remote_addr or 'unknown'
        endpoint = request.endpoint or 'unknown'
        key = f"{client_ip}:{endpoint}"
        if rate_limiter.is_limited(key):
            logger.warning(
                "Rate limit exceeded",
                extra={
                    'extra': {
                        'request_id': request.headers.get('X-Request-ID'),
                        'ip': client_ip,
                        'endpoint': endpoint
                    }
                }
            )
            return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
        rate_limiter.add_request(key)
        return func(*args, **kwargs)
    return wrapper

# Example usage:
# @app.route('/api/some-endpoint')
# @rate_limit_middleware
# def some_endpoint():
#     ...
