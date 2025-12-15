

from flask import Blueprint, request, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services import user_service

user_bp = Blueprint('user', __name__)

# Set user status
@user_bp.route('/user/status/<int:user_id>', methods=['POST'])
@verify_shopify_session_token
def api_set_status(user_id):
	data = request.get_json()
	status = data.get('status') if data else None
	result = user_service.set_user_status(user_id, status)
	return jsonify({'success': result})

# Suspend user
@user_bp.route('/user/suspend/<int:user_id>', methods=['POST'])
@verify_shopify_session_token
def api_suspend_user(user_id):
	data = request.get_json()
	reason = data.get('reason') if data else None
	result = user_service.suspend_user(user_id, reason)
	return jsonify({'success': result})

# Initiate password reset
@user_bp.route('/user/password-reset/initiate', methods=['POST'])
@verify_shopify_session_token
def api_initiate_password_reset():
	data = request.get_json()
	email = data.get('email') if data else None
	token = user_service.initiate_password_reset(email)
	return jsonify({'reset_token': token})

# Complete password reset
@user_bp.route('/user/password-reset/complete', methods=['POST'])
@verify_shopify_session_token
def api_complete_password_reset():
	data = request.get_json()
	token = data.get('token') if data else None
	new_password = data.get('new_password') if data else None
	result = user_service.complete_password_reset(token, new_password)
	return jsonify({'success': result})

