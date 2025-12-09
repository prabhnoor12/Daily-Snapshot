from flask import Blueprint, request, jsonify
from ..services.forecasting_service import (
    get_sales_forecast,
    get_orders_forecast
)

forecasting_bp = Blueprint('forecasting', __name__)

@forecasting_bp.route('/forecasting/sales/<int:shop_id>', methods=['GET'])
def api_sales_forecast(shop_id):
    return get_sales_forecast(shop_id)

@forecasting_bp.route('/forecasting/orders/<int:shop_id>', methods=['GET'])
def api_orders_forecast(shop_id):
    return get_orders_forecast(shop_id)
