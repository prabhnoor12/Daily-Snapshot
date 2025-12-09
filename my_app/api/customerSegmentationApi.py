from flask import Blueprint, request, jsonify
from ..services.customer_segmentation_service import get_customer_segments

customer_segmentation_bp = Blueprint('customer_segmentation', __name__)

@customer_segmentation_bp.route('/segmentation/<int:shop_id>', methods=['GET'])
def api_customer_segmentation(shop_id):
    return get_customer_segments(shop_id)
