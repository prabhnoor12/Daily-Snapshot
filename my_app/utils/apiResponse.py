

from flask import jsonify, make_response, request
from datetime import datetime
from my_app.middleware.logger import logger

# Helper to mask sensitive data
def mask_sensitive(data):
    if isinstance(data, dict):
        masked = data.copy()
        for key in masked:
            if key.lower() in ['password', 'token', 'secret']:
                masked[key] = '***MASKED***'
        return masked
    return data

# Helper for localization (stub)
def localize(message, locale=None):
    # Implement actual localization here
    return message


def success_response(data=None, message="Success", status_code=200, metadata=None, headers=None, locale=None):
    import datetime
    response = {
        "success": True,
        "message": localize(message, locale),
        "data": mask_sensitive(data),
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat() + 'Z',
        "metadata": metadata or {}
    }
    logger.info(
        "API Success",
        extra={
            'extra': {
                'request_id': request.headers.get('X-Request-ID'),
                'path': request.path,
                'response': response
            }
        }
    )
    resp = make_response(jsonify(response), status_code)
    if headers:
        for k, v in headers.items():
            resp.headers[k] = v
    return resp


def error_response(message="Error", status_code=400, errors=None, metadata=None, headers=None, locale=None):
    response = {
        "success": False,
        "message": localize(message, locale),
        "errors": mask_sensitive(errors),
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "metadata": metadata or {}
    }
    logger.warning(
        "API Error",
        extra={
            'extra': {
                'request_id': request.headers.get('X-Request-ID'),
                'path': request.path,
                'response': response
            }
        }
    )
    resp = make_response(jsonify(response), status_code)
    if headers:
        for k, v in headers.items():
            resp.headers[k] = v
    return resp


def validation_error_response(errors=None, message="Validation Error", status_code=422, metadata=None, headers=None, locale=None):
    response = {
        "success": False,
        "message": localize(message, locale),
        "errors": mask_sensitive(errors),
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "metadata": metadata or {}
    }
    logger.warning(
        "API Validation Error",
        extra={
            'extra': {
                'request_id': request.headers.get('X-Request-ID'),
                'path': request.path,
                'response': response
            }
        }
    )
    resp = make_response(jsonify(response), status_code)
    if headers:
        for k, v in headers.items():
            resp.headers[k] = v
    return resp

# Usage examples:
# return success_response(data={"user": user}, message="User fetched", status_code=200, metadata={"page": 1}, headers={"X-Request-ID": "abc"})
# return error_response(message="Invalid input", status_code=422, errors={"field": "reason"}, metadata={"request_id": "xyz"})
# return validation_error_response(errors={"email": "Invalid format"}, metadata={"request_id": "xyz"})
