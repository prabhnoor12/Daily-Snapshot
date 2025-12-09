from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
from my_app.crud.analytics_crud import get_daily_analytics_for_shop
from my_app.utils.shopify_api import get_shopify_orders, get_shopify_visitors, get_shopify_cart_events, get_shopify_checkout_events
import numpy as np

def get_conversion_funnel(shop_id, segment=None, start_date=None, end_date=None, shop_domain=None, access_token=None):
    """
    Advanced conversion funnel analysis: segmentation, time range, outlier/missing data handling, chart-ready output, recommendations.
    """
    try:
        # If Shopify credentials provided, fetch real data
        funnel_data = {}
        if shop_domain and access_token:
            # Orders
            orders = get_shopify_orders(shop_domain, access_token, start_date, end_date)
            funnel_data['orders'] = len(orders)
            # Visitors (placeholder, Shopify API does not provide directly)
            visitors = get_shopify_visitors(shop_domain, access_token, start_date, end_date)
            funnel_data['live_visitors'] = len(visitors)
            from my_app.crud.shopify_webhooks_crud import get_webhooks_by_shop
            from my_app.database import SessionLocal
            db = SessionLocal()
            webhooks = get_webhooks_by_shop(db, shop_domain)
            db.close()
            def filter_events(event_type):
                events = [w for w in webhooks if w.event_type == event_type]
                if start_date and end_date:
                    from datetime import datetime
                    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                    end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                    events = [w for w in events if w.received_at and start_dt <= w.received_at.date() <= end_dt]
                return events
            visitors_count = 0  # Not available via webhook
            add_to_cart_count = len(filter_events('cart/create'))
            checkout_count = len(filter_events('checkout/create'))
            orders_count = len(filter_events('orders/create'))
            analytics = [{
                'live_visitors': visitors_count,
                'add_to_cart': add_to_cart_count,
                'checkout': checkout_count,
                'orders': orders_count
            }]
        else:
            analytics = get_daily_analytics_for_shop(segment, shop_id)
            if start_date and end_date:
                from datetime import datetime
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                analytics = [a for a in analytics if start_dt <= a.date.date() <= end_dt]
        if not analytics or len(analytics) == 0:
            return error_response("No analytics data found for this shop.", status_code=404)
        # Steps: Visitors → Add to Cart → Checkout → Purchase
        steps = [
            {"name": "Visitors", "key": "live_visitors"},
            {"name": "Add to Cart", "key": "add_to_cart"},
            {"name": "Checkout", "key": "checkout"},
            {"name": "Purchase", "key": "orders"}
        ]
        # Handle missing data and outliers
        def clean_series(series):
            arr = np.array([v for v in series if v is not None], dtype=np.float32)
            if len(arr) == 0:
                return arr
            q1, q3 = np.percentile(arr, [25, 75])
            iqr = q3 - q1
            lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            arr = arr[(arr >= lower) & (arr <= upper)]
            return arr
        funnel_counts = {}
        avg_counts = {}
        warnings = []
        for step in steps:
            raw = [getattr(a, step["key"], None) for a in analytics]
            cleaned = clean_series(raw)
            avg = int(np.nanmean(cleaned)) if len(cleaned) > 0 else 0
            funnel_counts[step["name"]] = raw
            avg_counts[step["name"]] = avg
            missing = sum(1 for v in raw if v is None)
            if missing > 0:
                warnings.append(f"{missing} missing values for {step['name']}")
            if len(cleaned) > 0:
                outliers = len(raw) - len(cleaned)
                if outliers > 0:
                    warnings.append(f"{outliers} outlier values for {step['name']}")
        # Conversion rates and drop-off
        conversion_rates = {}
        drop_off_rates = {}
        for i in range(len(steps) - 1):
            from_step = steps[i]["name"]
            to_step = steps[i+1]["name"]
            from_count = avg_counts[from_step]
            to_count = avg_counts[to_step]
            rate = round((to_count / from_count) * 100, 2) if from_count else 0.0
            conversion_rates[f"{from_step} → {to_step}"] = rate
            drop_off = round(100 - rate, 2)
            drop_off_rates[f"{from_step} → {to_step}"] = drop_off
        # Chart-ready data
        chart_data = {
            "labels": [step["name"] for step in steps],
            "series": [avg_counts[step["name"]] for step in steps]
        }
        # Segmentation results
        segment_results = {}
        if segment:
            from collections import defaultdict
            seg_map = defaultdict(list)
            for a in analytics:
                seg_val = getattr(a, segment, None)
                if seg_val:
                    seg_map[seg_val].append(a)
            for seg_val, seg_analytics in seg_map.items():
                seg_counts = {step["name"]: int(np.nanmean(clean_series([getattr(a, step["key"], None) for a in seg_analytics]))) for step in steps}
                segment_results[seg_val] = seg_counts
        # Recommendations
        recommendations = []
        for k, v in drop_off_rates.items():
            if v > 50:
                recommendations.append(f"High drop-off at {k}. Consider improving UX or incentives at this step.")
        if not recommendations:
            recommendations.append("Your funnel is healthy. Keep monitoring for changes.")
        result = {
            "funnel_steps": steps,
            "average_counts": avg_counts,
            "conversion_rates": conversion_rates,
            "drop_off_rates": drop_off_rates,
            "chart_data": chart_data,
            "warnings": warnings,
            "segment_results": segment_results,
            "recommendations": recommendations
        }
        return success_response(result, message="Advanced conversion funnel analysis complete")
    except Exception as e:
        logger.error(f"Conversion funnel error: {e}")
        return error_response("Conversion funnel failed")
