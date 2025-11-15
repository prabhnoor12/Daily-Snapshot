
from flask import Blueprint, request, jsonify
from ..services import subscription_service

subscription_bp = Blueprint('subscription', __name__)

# Start trial
@subscription_bp.route('/subscription/start-trial/<int:user_id>', methods=['POST'])
def api_start_trial(user_id):
	plan = request.json.get('plan', 'standard')
	trial_days = request.json.get('trial_days', 15)
	notify_user = request.json.get('notify_user', True)
	result = subscription_service.start_trial(user_id, plan, trial_days, notify_user)
	return jsonify({'success': result})

# Convert trial to paid
@subscription_bp.route('/subscription/convert/<int:subscription_id>', methods=['POST'])
def api_convert_trial(subscription_id):
	notify_user = request.json.get('notify_user', True)
	result = subscription_service.convert_trial_to_paid(subscription_id, notify_user)
	return jsonify({'success': result})

# Renew subscription
@subscription_bp.route('/subscription/renew/<int:subscription_id>', methods=['POST'])
def api_renew(subscription_id):
	renewal_days = request.json.get('renewal_days', 30)
	auto_renew = request.json.get('auto_renew', True)
	notify_user = request.json.get('notify_user', True)
	result = subscription_service.renew_subscription(subscription_id, renewal_days, auto_renew, notify_user)
	return jsonify({'success': result})

# Handle expiry
@subscription_bp.route('/subscription/handle-expiry/<int:subscription_id>', methods=['POST'])
def api_handle_expiry(subscription_id):
	notify_user = request.json.get('notify_user', True)
	result = subscription_service.handle_expiry(subscription_id, notify_user)
	return jsonify({'success': result})

# Check grace period
@subscription_bp.route('/subscription/in-grace/<int:subscription_id>', methods=['GET'])
def api_in_grace(subscription_id):
	notify_user = request.args.get('notify_user', True, type=bool)
	result = subscription_service.is_in_grace_period(subscription_id, notify_user)
	return jsonify({'in_grace': result})
