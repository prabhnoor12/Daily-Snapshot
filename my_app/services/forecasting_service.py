from my_app.crud.analytics_crud import get_daily_analytics_for_shop
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
from datetime import datetime, timedelta
import numpy as np

def get_sales_forecast(shop_id):
    try:
        # Fetch last 30 days of sales
        analytics = get_daily_analytics_for_shop(None, shop_id)
        sales = [a.sales for a in analytics][-30:]
        if len(sales) < 7:
            return error_response("Not enough data for forecasting", status_code=400)
        # Simple moving average forecast
        forecast = float(np.mean(sales[-7:]))
        return success_response({"next_week_sales_forecast": forecast * 7}, message="Sales forecast for next week")
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return error_response("Forecasting failed")

def get_orders_forecast(shop_id):
    try:
        analytics = get_daily_analytics_for_shop(None, shop_id)
        orders = [a.orders for a in analytics][-30:]
        if len(orders) < 7:
            return error_response("Not enough data for forecasting", status_code=400)
        forecast = float(np.mean(orders[-7:]))
        return success_response({"next_week_orders_forecast": forecast * 7}, message="Orders forecast for next week")
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return error_response("Forecasting failed")
