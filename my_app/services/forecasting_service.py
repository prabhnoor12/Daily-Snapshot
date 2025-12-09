
from my_app.crud.analytics_crud import get_daily_analytics_for_shop
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
from datetime import datetime, timedelta
import numpy as np

# Advanced forecasting imports
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
import warnings as py_warnings

def _clean_series(series):
    # Remove missing data and outliers
    arr = np.array(series, dtype=np.float32)
    arr = arr[~np.isnan(arr)]
    if len(arr) == 0:
        return arr
    q1, q3 = np.percentile(arr, [25, 75])
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    arr = arr[(arr >= lower) & (arr <= upper)]
    return arr

def _exp_smoothing_forecast(series, steps=7):
    try:
        model = ExponentialSmoothing(series, trend='add', seasonal=None)
        fit = model.fit()
        forecast = fit.forecast(steps)
        conf_int = None
        return forecast.tolist(), conf_int
    except Exception:
        return [float(np.mean(series))] * steps, None

def _arima_forecast(series, steps=7):
    try:
        py_warnings.filterwarnings("ignore")
        model = ARIMA(series, order=(2,1,2))
        fit = model.fit()
        forecast = fit.get_forecast(steps)
        mean_forecast = forecast.predicted_mean.tolist()
        conf_int = forecast.conf_int().tolist()
        return mean_forecast, conf_int
    except Exception:
        return [float(np.mean(series))] * steps, None

def _chart_ready(series, dates):
    # Prepare chart data for frontend
    return [{"date": d.strftime('%Y-%m-%d'), "value": float(v) if v is not None else None} for d, v in zip(dates, series)]

def get_sales_forecast(shop_id, segment=None):
    try:
        analytics = get_daily_analytics_for_shop(segment, shop_id)
        sales = [getattr(a, 'sales', None) for a in analytics][-30:]
        dates = [getattr(a, 'date', None) for a in analytics][-30:]
        cleaned_sales = _clean_series(sales)
        warnings = []
        if len(cleaned_sales) < 7:
            warnings.append("Not enough clean data for robust forecasting. Results may be unreliable. Please add more sales data for better accuracy.")
        if len(cleaned_sales) == 0:
            return error_response("No valid sales data available", status_code=400)
        # Advanced: Exponential Smoothing and ARIMA
        exp_forecast, exp_conf = _exp_smoothing_forecast(cleaned_sales, steps=7)
        arima_forecast, arima_conf = _arima_forecast(cleaned_sales, steps=7)
        trend = float(np.polyfit(np.arange(len(cleaned_sales)), cleaned_sales, 1)[0]) if len(cleaned_sales) > 1 else 0.0
        chart_data = _chart_ready(sales, dates)
        # User-friendly summary and recommendations
        summary = f"Expected sales for next week: {round(np.mean(exp_forecast) * 7, 2)}. "
        if trend > 0:
            recommendation = "Your sales are trending up! Consider increasing inventory or marketing spend."
        elif trend < 0:
            recommendation = "Sales are trending down. Review your product listings and consider promotions."
        else:
            recommendation = "Sales are stable. Maintain current strategy."
        result = {
            "next_week_sales_forecast": round(np.mean(exp_forecast) * 7, 2),
            "exp_smoothing_forecast": [round(f, 2) for f in exp_forecast],
            "arima_forecast": [round(f, 2) for f in arima_forecast],
            "arima_confidence_intervals": arima_conf,
            "trend": trend,
            "chart_data": chart_data,
            "warnings": warnings,
            "segment": segment
            ,"summary": summary,
            "recommendation": recommendation
        }
        msg = "Sales forecast for next week (Exponential Smoothing & ARIMA)"
        if warnings:
            msg += ". Warnings: " + "; ".join(warnings)
        return success_response(result, message=msg)
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return error_response("Forecasting failed")

def get_orders_forecast(shop_id, segment=None):
    try:
        analytics = get_daily_analytics_for_shop(segment, shop_id)
        orders = [getattr(a, 'orders', None) for a in analytics][-30:]
        dates = [getattr(a, 'date', None) for a in analytics][-30:]
        cleaned_orders = _clean_series(orders)
        warnings = []
        if len(cleaned_orders) < 7:
            warnings.append("Not enough clean data for robust forecasting. Results may be unreliable. Please add more order data for better accuracy.")
        if len(cleaned_orders) == 0:
            return error_response("No valid orders data available", status_code=400)
        exp_forecast, exp_conf = _exp_smoothing_forecast(cleaned_orders, steps=7)
        arima_forecast, arima_conf = _arima_forecast(cleaned_orders, steps=7)
        trend = float(np.polyfit(np.arange(len(cleaned_orders)), cleaned_orders, 1)[0]) if len(cleaned_orders) > 1 else 0.0
        chart_data = _chart_ready(orders, dates)
        summary = f"Expected orders for next week: {round(np.mean(exp_forecast) * 7, 2)}. "
        if trend > 0:
            recommendation = "Order volume is increasing! Prepare for higher demand."
        elif trend < 0:
            recommendation = "Order volume is decreasing. Consider customer engagement strategies."
        else:
            recommendation = "Order volume is stable. Maintain current operations."
        result = {
            "next_week_orders_forecast": round(np.mean(exp_forecast) * 7, 2),
            "exp_smoothing_forecast": [round(f, 2) for f in exp_forecast],
            "arima_forecast": [round(f, 2) for f in arima_forecast],
            "arima_confidence_intervals": arima_conf,
            "trend": trend,
            "chart_data": chart_data,
            "warnings": warnings,
            "segment": segment
            ,"summary": summary,
            "recommendation": recommendation
        }
        msg = "Orders forecast for next week (Exponential Smoothing & ARIMA)"
        if warnings:
            msg += ". Warnings: " + "; ".join(warnings)
        return success_response(result, message=msg)
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return error_response("Forecasting failed")
