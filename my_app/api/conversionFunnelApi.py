from flask import Blueprint
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services.conversion_funnel_service import get_conversion_funnel

conversion_funnel_bp = Blueprint('conversion_funnel', __name__)

@conversion_funnel_bp.route('/funnel/<int:shop_id>', methods=['GET'])
@verify_shopify_session_token
def api_conversion_funnel(shop_id):
    return get_conversion_funnel(shop_id)
