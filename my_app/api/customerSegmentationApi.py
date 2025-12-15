from flask import Blueprint, request, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services.customer_segmentation_service import get_customer_segments

customer_segmentation_bp = Blueprint('customer_segmentation', __name__)

@customer_segmentation_bp.route('/segmentation/<int:shop_id>', methods=['GET'])
@verify_shopify_session_token
def api_customer_segmentation(shop_id):
    # Support future extensible query params (e.g., filter, export)
    # Example: filter by region/device/customer_type
    filter_region = request.args.get('region')
    filter_device = request.args.get('device')
    filter_customer_type = request.args.get('customer_type')
    # Pass filters as a dict if service supports
    filters = {}
    if filter_region:
        filters['region'] = filter_region
    if filter_device:
        filters['device'] = filter_device
    if filter_customer_type:
        filters['customer_type'] = filter_customer_type
    response = get_customer_segments(shop_id)  # Extend service to accept filters if needed
    return jsonify(response)
