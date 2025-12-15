from flask import Blueprint, request, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services.notification_service import send_push_notification

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notifications/push', methods=['POST'])
@verify_shopify_session_token
def api_send_push():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    message = data.get('message')
    return send_push_notification(user_id, message)
