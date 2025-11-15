
from flask import Blueprint, request, jsonify
from ..services.analytics_service import (
	get_day_over_day_performance,
	get_7_day_trend_charts,
	get_top_products_of_day,
	get_order_status_breakdown,
	get_real_time_visitor_count,
	get_average_order_value,
	export_daily_snapshot,
	get_customizable_dashboard_metrics,
	check_basic_alerts,
	get_mobile_dashboard_data
)

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/day-over-day/<int:shop_id>', methods=['GET'])
def api_day_over_day(shop_id):
	return get_day_over_day_performance(shop_id)

@analytics_bp.route('/analytics/7-day-trends/<int:shop_id>', methods=['GET'])
def api_7_day_trends(shop_id):
	return get_7_day_trend_charts(shop_id)

@analytics_bp.route('/analytics/top-products/<int:shop_id>', methods=['GET'])
def api_top_products(shop_id):
	top_n = request.args.get('top_n', default=3, type=int)
	return get_top_products_of_day(shop_id, top_n)

@analytics_bp.route('/analytics/order-status/<int:shop_id>', methods=['GET'])
def api_order_status(shop_id):
	return get_order_status_breakdown(shop_id)

@analytics_bp.route('/analytics/real-time-visitors/<int:shop_id>', methods=['GET'])
def api_real_time_visitors(shop_id):
	return get_real_time_visitor_count(shop_id)

@analytics_bp.route('/analytics/aov/<int:shop_id>', methods=['GET'])
def api_aov(shop_id):
	return get_average_order_value(shop_id)

@analytics_bp.route('/analytics/export/<int:shop_id>', methods=['GET'])
def api_export(shop_id):
	format = request.args.get('format', default='csv', type=str)
	return export_daily_snapshot(shop_id, format)

@analytics_bp.route('/analytics/custom-dashboard/<int:shop_id>', methods=['POST'])
def api_custom_dashboard(shop_id):
	data = request.get_json() or {}
	selected_metrics = data.get('selected_metrics', [])
	return get_customizable_dashboard_metrics(shop_id, selected_metrics)

@analytics_bp.route('/analytics/alerts/<int:shop_id>', methods=['GET'])
def api_alerts(shop_id):
	sales_goal = request.args.get('sales_goal', default=1000, type=int)
	inventory_threshold = request.args.get('inventory_threshold', default=10, type=int)
	return check_basic_alerts(shop_id, sales_goal, inventory_threshold)

@analytics_bp.route('/analytics/mobile-dashboard/<int:shop_id>', methods=['GET'])
def api_mobile_dashboard(shop_id):
	return get_mobile_dashboard_data(shop_id)
