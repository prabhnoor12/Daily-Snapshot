import logging
from flask import jsonify


# Configure logging
logger = logging.getLogger('error_handling')
logger.setLevel(logging.ERROR)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Custom error classes
class ValidationError(Exception):
    pass

class AuthError(Exception):
    pass

# Helper to get request context
def get_request_context():
    from flask import request
    user = getattr(request, 'user', None)
    user_info = str(user) if user else 'anonymous'
    return {
        'endpoint': request.endpoint,
        'method': request.method,
        'url': request.url,
        'user': user_info,
        'remote_addr': request.remote_addr
    }

# Generic error handler for Flask
def register_error_handlers(app):
    from flask import request

    @app.errorhandler(Exception)
    def handle_exception(e):
        ctx = get_request_context()
        logger.error(f"Unhandled Exception: {e} | Context: {ctx}", exc_info=True)
        response = {
            'error': 'Internal Server Error',
            'message': str(e)
        }
        return jsonify(response), 500

    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        ctx = get_request_context()
        logger.warning(f"ValidationError: {e} | Context: {ctx}")
        response = {
            'error': 'Validation Error',
            'message': str(e)
        }
        return jsonify(response), 422

    @app.errorhandler(AuthError)
    def handle_auth_error(e):
        ctx = get_request_context()
        logger.warning(f"AuthError: {e} | Context: {ctx}")
        response = {
            'error': 'Authentication Error',
            'message': str(e)
        }
        return jsonify(response), 401

    @app.errorhandler(403)
    def forbidden(e):
        ctx = get_request_context()
        logger.warning(f"403 Forbidden: {e} | Context: {ctx}")
        response = {
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource.'
        }
        return jsonify(response), 403

    @app.errorhandler(404)
    def not_found(e):
        from flask import request
        ctx = get_request_context()
        logger.warning(f"404 Not Found: {e} | Context: {ctx}")
        response = {
            'error': 'Not Found',
            'message': 'The requested resource was not found.',
            'details': {
                'method': request.method,
                'path': request.path,
                'args': request.args.to_dict(),
                'headers': dict(request.headers),
                'endpoint': request.endpoint,
                'url': request.url
            },
            'context': ctx
        }
        return jsonify(response), 404

    @app.errorhandler(400)
    def bad_request(e):
        ctx = get_request_context()
        logger.warning(f"400 Bad Request: {e} | Context: {ctx}")
        response = {
            'error': 'Bad Request',
            'message': 'The request could not be understood or was missing required parameters.'
        }
        return jsonify(response), 400

    @app.errorhandler(422)
    def unprocessable_entity(e):
        ctx = get_request_context()
        logger.warning(f"422 Unprocessable Entity: {e} | Context: {ctx}")
        response = {
            'error': 'Unprocessable Entity',
            'message': 'The request was well-formed but was unable to be followed due to semantic errors.'
        }
        return jsonify(response), 422

# Usage:
# from utils.error_handling import register_error_handlers, ValidationError, AuthError
# register_error_handlers(app)
