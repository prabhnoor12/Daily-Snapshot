from my_app.crud.analytics_crud import get_daily_analytics_for_shop
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
import numpy as np

def get_benchmarking_data(shop_id):
    try:
        # Fetch this shop's analytics
        shop_analytics = get_daily_analytics_for_shop(None, shop_id)
        shop_sales = [a.sales for a in shop_analytics][-30:]
        # Placeholder: Fetch all shops' analytics (anonymized)
        # In real implementation, aggregate from all shops except this one
        all_shops_sales = shop_sales + [s * np.random.uniform(0.8, 1.2) for s in shop_sales]  # Simulate
        shop_avg = float(np.mean(shop_sales)) if shop_sales else 0
        industry_avg = float(np.mean(all_shops_sales)) if all_shops_sales else 0
        return success_response({
            "shop_avg_sales": shop_avg,
            "industry_avg_sales": industry_avg,
            "percentile": int(100 * (shop_avg / industry_avg)) if industry_avg else 0
        }, message="Benchmarking data")
    except Exception as e:
        logger.error(f"Benchmarking error: {e}")
        return error_response("Benchmarking failed")
