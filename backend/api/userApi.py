

from flask import Blueprint, request, jsonify
from ..services import user_service

user_bp = Blueprint('user', __name__)

# Set user status
@user_bp.route('/user/status/<int:user_id>', methods=['POST'])
def api_set_status(user_id):
	status = request.json.get('status')
	result = user_service.set_user_status(user_id, status)
	return jsonify({'success': result})

# Suspend user
@user_bp.route('/user/suspend/<int:user_id>', methods=['POST'])
def api_suspend_user(user_id):
	reason = request.json.get('reason')
	result = user_service.suspend_user(user_id, reason)
	return jsonify({'success': result})

# Initiate password reset
@user_bp.route('/user/password-reset/initiate', methods=['POST'])
def api_initiate_password_reset():
	email = request.json.get('email')
	token = user_service.initiate_password_reset(email)
	return jsonify({'reset_token': token})

# Complete password reset
@user_bp.route('/user/password-reset/complete', methods=['POST'])
def api_complete_password_reset():
	token = request.json.get('token')
	new_password = request.json.get('new_password')
	result = user_service.complete_password_reset(token, new_password)
	return jsonify({'success': result})

