
"""
Business logic for analytics operations. Data access is delegated to analytics CRUD and other modules.
"""

from ..crud.analytics_crud import (
	get_daily_analytics_for_shop_and_date,
	get_daily_analytics_for_shop
)
from ..crud.shop_crud import get_shop
from ..database import SessionLocal
from ..utils.apiResponse import success_response, error_response
from ..utils.validaion import is_non_empty_string
from ..middleware.logger import logger
from datetime import datetime, timedelta
import csv
import io





def get_day_over_day_performance(shop_id):
	"""
	Returns today's sales, orders, and visitors compared to yesterday for the given shop.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		yesterday = today - timedelta(days=1)
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		yesterday_data = get_daily_analytics_for_shop_and_date(db, shop_id, yesterday)
		result = {
			"today": {
				"sales": today_data.sales if today_data else 0,
				"orders": today_data.orders if today_data else 0,
				"visitors": today_data.live_visitors if today_data else 0
			},
			"yesterday": {
				"sales": yesterday_data.sales if yesterday_data else 0,
				"orders": yesterday_data.orders if yesterday_data else 0,
				"visitors": yesterday_data.live_visitors if yesterday_data else 0
			}
		}
		logger.info(f"Day-over-Day Performance fetched for shop_id {shop_id}")
		return success_response(result, message="Day-over-Day Performance")
	except Exception as e:
		logger.error(f"Error in get_day_over_day_performance: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_7_day_trend_charts(shop_id):
	"""
	Returns 7-day trend data for sales, orders, and visitors for charting.
	Future: Add caching for performance.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		analytics = get_daily_analytics_for_shop(db, shop_id)
		last_7 = analytics[:7][::-1] if analytics else []
		chart_data = {
			"dates": [a.date.strftime('%Y-%m-%d') for a in last_7],
			"sales": [a.sales for a in last_7],
			"orders": [a.orders for a in last_7],
			"visitors": [a.live_visitors for a in last_7]
		}
		logger.info(f"7-Day Trend Charts fetched for shop_id {shop_id}")
		return success_response(chart_data, message="7-Day Trend Charts")
	except Exception as e:
		logger.error(f"Error in get_7_day_trend_charts: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_top_products_of_day(shop_id, top_n=3):
	"""
	Returns the top N selling products of the day with sales and order counts.
	Future: Integrate with orders/products table for real data.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		top_products = []
		if today_data and today_data.top_product:
			top_products = today_data.top_product.split(',')[:top_n]
		# Placeholder: sales/orders should be fetched from real tables
		result = [{"product": p, "sales": None, "orders": None} for p in top_products]
		logger.info(f"Top Products of the Day fetched for shop_id {shop_id}")
		return success_response(result, message="Top Products of the Day")
	except Exception as e:
		logger.error(f"Error in get_top_products_of_day: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_order_status_breakdown(shop_id):
	"""
	Returns counts of fulfilled, pending, and cancelled orders for today.
	Future: Integrate with orders table for real data.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	try:
		# Placeholder: In real app, fetch from orders table
		result = {
			"fulfilled": 10,
			"pending": 2,
			"cancelled": 1
		}
		logger.info(f"Order Status Breakdown fetched for shop_id {shop_id}")
		return success_response(result, message="Order Status Breakdown")
	except Exception as e:
		logger.error(f"Error in get_order_status_breakdown: {e}")
		return error_response(str(e), status_code=500)



def get_real_time_visitor_count(shop_id):
	"""
	Returns the number of visitors currently active or active in the last 5 minutes.
	Future: Add caching for performance.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		visitors = today_data.live_visitors if today_data else 0
		logger.info(f"Real-Time Visitor Count fetched for shop_id {shop_id}")
		return success_response({"live_visitors": visitors}, message="Real-Time Visitor Count")
	except Exception as e:
		logger.error(f"Error in get_real_time_visitor_count: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_average_order_value(shop_id):
	"""
	Calculates and returns today's Average Order Value (AOV).
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		aov = today_data.aov if today_data else 0
		logger.info(f"AOV fetched for shop_id {shop_id}")
		return success_response({"aov": aov}, message="Average Order Value (AOV)")
	except Exception as e:
		logger.error(f"Error in get_average_order_value: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def export_daily_snapshot(shop_id, format='csv'):
	"""
	Exports today's snapshot as a CSV for the merchant. (PDF not implemented)
	Future: Add PDF export using ReportLab or similar.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		if not today_data:
			logger.warning(f"No analytics data for today for shop_id {shop_id}")
			return error_response("No analytics data for today", status_code=404)
		output = io.StringIO()
		writer = csv.writer(output)
		writer.writerow(["date", "sales", "orders", "aov", "live_visitors", "top_product"])
		writer.writerow([
			today_data.date.strftime('%Y-%m-%d'),
			today_data.sales,
			today_data.orders,
			today_data.aov,
			today_data.live_visitors,
			today_data.top_product
		])
		logger.info(f"Daily snapshot exported for shop_id {shop_id}")
		return success_response({"csv": output.getvalue()}, message="Exported Daily Snapshot (CSV)")
	except Exception as e:
		logger.error(f"Error in export_daily_snapshot: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_customizable_dashboard_metrics(shop_id, selected_metrics=None):
	"""
	Returns only the metrics selected by the user for their dashboard.
	Provides defaults if none are selected.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	if not selected_metrics or not isinstance(selected_metrics, list):
		selected_metrics = ["sales", "orders", "aov", "live_visitors"]
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		if not today_data:
			logger.warning(f"No analytics data for today for shop_id {shop_id}")
			return error_response("No analytics data for today", status_code=404)
		result = {metric: getattr(today_data, metric, None) for metric in selected_metrics}
		logger.info(f"Customizable Dashboard Metrics fetched for shop_id {shop_id}")
		return success_response(result, message="Customizable Dashboard Metrics")
	except Exception as e:
		logger.error(f"Error in get_customizable_dashboard_metrics: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def check_basic_alerts(shop_id, sales_goal=1000, inventory_threshold=10):
	"""
	Checks if sales hit a daily goal or if inventory is low for top products and returns alerts.
	Future: Allow merchants to set custom goals and thresholds.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		alerts = []
		if today_data:
			if today_data.sales >= sales_goal:
				alerts.append("Sales goal reached!")
			# Inventory check placeholder
			if today_data.top_product:
				alerts.append(f"Check inventory for {today_data.top_product}")
		logger.info(f"Basic Alerts checked for shop_id {shop_id}")
		return success_response({"alerts": alerts}, message="Basic Alerts")
	except Exception as e:
		logger.error(f"Error in check_basic_alerts: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()



def get_mobile_dashboard_data(shop_id):
	"""
	Returns analytics data optimized for mobile dashboard display.
	Future: Detect device type and optimize payload.
	"""
	if not isinstance(shop_id, int) or shop_id <= 0:
		logger.error(f"Invalid shop_id: {shop_id}")
		return error_response("Invalid shop_id", status_code=400)
	db = SessionLocal()
	try:
		today = datetime.utcnow().date()
		today_data = get_daily_analytics_for_shop_and_date(db, shop_id, today)
		if not today_data:
			logger.warning(f"No analytics data for today for shop_id {shop_id}")
			return error_response("No analytics data for today", status_code=404)
		# Return a minimal set for mobile
		result = {
			"sales": today_data.sales,
			"orders": today_data.orders,
			"aov": today_data.aov,
			"live_visitors": today_data.live_visitors
		}
		logger.info(f"Mobile Dashboard Data fetched for shop_id {shop_id}")
		return success_response(result, message="Mobile Dashboard Data")
	except Exception as e:
		logger.error(f"Error in get_mobile_dashboard_data: {e}")
		return error_response(str(e), status_code=500)
	finally:
		db.close()
