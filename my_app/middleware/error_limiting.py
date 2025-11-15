import time
from flask import request, jsonify
from functools import wraps
from collections import defaultdict

# Simple in-memory rate limiter for errors
class ErrorLimiter:
    def __init__(self, max_errors=5, window_seconds=60):
        self.max_errors = max_errors
        self.window_seconds = window_seconds
        self.error_counts = defaultdict(list)

    def is_limited(self, key):
        now = time.time()
        # Remove old errors
        self.error_counts[key] = [t for t in self.error_counts[key] if now - t < self.window_seconds]
        return len(self.error_counts[key]) >= self.max_errors

    def add_error(self, key):
        self.error_counts[key].append(time.time())

error_limiter = ErrorLimiter()

def error_limit_middleware(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        client_ip = request.remote_addr or 'unknown'
        if error_limiter.is_limited(client_ip):
            return jsonify({'error': 'Too many errors, please try again later.'}), 429
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_limiter.add_error(client_ip)
            return jsonify({'error': str(e)}), 500
    return wrapper

# Example usage:
# @app.route('/api/some-endpoint')
# @error_limit_middleware
# def some_endpoint():
#     ...
