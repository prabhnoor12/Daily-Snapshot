
from flask import Blueprint, request, jsonify
from ..services import shopify_webhooks

shopify_webhook_bp = Blueprint('shopify_webhook', __name__)

# Shopify webhook endpoint
@shopify_webhook_bp.route('/webhook/shopify', methods=['POST'])
def api_shopify_webhook():
	# Verify webhook signature
	if not shopify_webhooks.verify_shopify_webhook(request.headers, request.data):
		return jsonify({'error': 'Invalid webhook signature'}), 401
	# Parse and process webhook
	try:
		payload = request.get_json(force=True)
		result = shopify_webhooks.process_webhook_with_retry(payload)
		return jsonify({'status': 'processed', 'id': getattr(result, 'id', None)}), 200
	except Exception as e:
		return jsonify({'error': str(e)}), 400
