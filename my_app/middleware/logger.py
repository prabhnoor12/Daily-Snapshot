
import logging
import json
import uuid
from flask import request, g
from datetime import datetime

# Helper to mask sensitive data
def mask_sensitive(data):
    if isinstance(data, dict):
        masked = data.copy()
        for key in masked:
            if key.lower() in ['password', 'token', 'secret']:
                masked[key] = '***MASKED***'
        return masked
    return data

# JSON log formatter
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': self.formatTime(record, self.datefmt),
            'level': record.levelname,
            'name': record.name,
            'message': record.getMessage(),
        }
        if hasattr(record, 'extra'):  # for custom fields
            log_record.update(record.extra)
        return json.dumps(log_record)

# Configure global logger
logger = logging.getLogger('daily_snapshot')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
json_formatter = JSONFormatter()
handler.setFormatter(json_formatter)
logger.handlers = []
logger.addHandler(handler)

# Middleware for logging requests and responses with correlation/request IDs
def log_request():
    import datetime
    g.start_time = datetime.datetime.now(datetime.UTC)
    g.request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
    masked_args = mask_sensitive(request.args.to_dict())
    masked_json = mask_sensitive(request.get_json(silent=True) or {})
    logger.info(
        f"Request",
        extra={
            'extra': {
                'request_id': g.request_id,
                'method': request.method,
                'path': request.path,
                'ip': request.remote_addr,
                'user': str(getattr(request, 'user', 'anonymous')),
                'args': masked_args,
                'json': masked_json
            }
        }
    )

def log_response(response):
    import datetime
    duration = (datetime.datetime.now(datetime.UTC) - g.start_time).total_seconds() if hasattr(g, 'start_time') else None
    logger.info(
        f"Response",
        extra={
            'extra': {
                'request_id': getattr(g, 'request_id', None),
                'method': request.method,
                'path': request.path,
                'status': response.status_code,
                'duration': duration
            }
        }
    )
    response.headers['X-Request-ID'] = getattr(g, 'request_id', '')
    return response

# Error logging for unhandled exceptions
def log_error(e):
    logger.error(
        f"Unhandled Exception: {str(e)}",
        extra={
            'extra': {
                'request_id': getattr(g, 'request_id', None),
                'method': request.method,
                'path': request.path,
                'ip': request.remote_addr,
                'user': str(getattr(request, 'user', 'anonymous')),
                'error': str(e)
            }
        }
    )

# Usage in Flask app:
# from middleware.logger import log_request, log_response, log_error
# app.before_request(log_request)
# app.after_request(log_response)
# app.register_error_handler(Exception, log_error)

# For logging in other modules:
# from middleware.logger import logger
# logger.info("Custom log message", extra={"extra": {"request_id": "abc"}})
