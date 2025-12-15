
from flask import Blueprint, request, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services import setting_services

setting_bp = Blueprint('setting', __name__)

# Get all settings for a user
@setting_bp.route('/settings/<int:user_id>', methods=['GET'])
@verify_shopify_session_token
def api_get_settings(user_id):
	db_result = setting_services.get_settings_by_user(user_id)
	return jsonify(db_result)

# Load default settings for a user
@setting_bp.route('/settings/load-defaults/<int:user_id>', methods=['POST'])
@verify_shopify_session_token
def api_load_defaults(user_id):
	overrides = request.get_json() or {}
	result = setting_services.load_default_settings_for_user(user_id, overrides)
	return jsonify(result)

# Bulk update settings
@setting_bp.route('/settings/bulk-update/<int:user_id>', methods=['POST'])
@verify_shopify_session_token
def api_bulk_update(user_id):
	settings_dict = request.get_json() or {}
	transactional = request.args.get('transactional', default=False, type=bool)
	result = setting_services.bulk_update_settings(user_id, settings_dict, transactional)
	return jsonify(result)

# Reset settings to default
@setting_bp.route('/settings/reset/<int:user_id>', methods=['POST'])
@verify_shopify_session_token
def api_reset_settings(user_id):
	data = request.get_json() or {}
	keys = data.get('keys')
	notify_user = data.get('notify_user', False)
	result = setting_services.reset_settings_to_default(user_id, keys, notify_user)
	return jsonify(result)
