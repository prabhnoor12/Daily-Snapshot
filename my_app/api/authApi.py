
from flask import Blueprint, request, jsonify, session
from ..services import auth_service

auth_bp = Blueprint('auth', __name__)

# Login endpoint
@auth_bp.route('/auth/login', methods=['POST'])
def api_login():
	data = request.get_json() or {}
	email = data.get('email')
	password = data.get('password')
	return auth_service.login(email, password)

# Logout endpoint
@auth_bp.route('/auth/logout', methods=['POST'])
def api_logout():
	token = request.headers.get('Authorization', '').replace('Bearer ', '')
	return auth_service.logout(token)

# Refresh token endpoint
@auth_bp.route('/auth/refresh', methods=['POST'])
def api_refresh():
	token = request.headers.get('Authorization', '').replace('Bearer ', '')
	return auth_service.refresh_token(token)

# Password reset endpoint
@auth_bp.route('/auth/reset-password', methods=['POST'])
def api_reset_password():
	data = request.get_json() or {}
	email = data.get('email')
	new_password = data.get('new_password')
	return auth_service.reset_password(email, new_password)

# Shopify OAuth initiation
@auth_bp.route('/auth/shopify/initiate', methods=['GET'])
def api_shopify_oauth_initiate():
	shop_domain = request.args.get('shop_domain')
	return auth_service.initiate_shopify_oauth(shop_domain, session)

# Shopify OAuth callback
@auth_bp.route('/auth/shopify/callback', methods=['GET'])
def api_shopify_oauth_callback():
	return jsonify(*auth_service.handle_shopify_callback(request.args, session))
