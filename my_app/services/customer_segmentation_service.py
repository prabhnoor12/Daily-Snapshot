from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
from my_app.crud.user_crud import get_customers_for_shop
import numpy as np
from collections import Counter

def get_customer_segments(shop_id):
    """
    Segment customers by type, location, device, and provide chart-ready data.
    """
    try:
        customers = get_customers_for_shop(shop_id)
        if not customers or len(customers) == 0:
            return error_response("No customers found for segmentation", status_code=404)
        # Example fields: type, location, device
        types = [getattr(c, 'customer_type', None) for c in customers]
        locations = [getattr(c, 'region', None) for c in customers]
        devices = [getattr(c, 'device', None) for c in customers]
        # Count segments
        type_counts = dict(Counter(types))
        location_counts = dict(Counter(locations))
        device_counts = dict(Counter(devices))
        # Chart-ready data
        chart_data = {
            "type": [{"segment": k, "count": v} for k, v in type_counts.items()],
            "location": [{"segment": k, "count": v} for k, v in location_counts.items()],
            "device": [{"segment": k, "count": v} for k, v in device_counts.items()]
        }
        # Summary
        summary = f"{len(customers)} customers segmented by type, location, and device."
        result = {
            "total_customers": len(customers),
            "type_segments": type_counts,
            "location_segments": location_counts,
            "device_segments": device_counts,
            "chart_data": chart_data,
            "summary": summary
        }
        return success_response(result, message="Customer segmentation successful")
    except Exception as e:
        logger.error(f"Customer segmentation error: {e}")
        return error_response("Customer segmentation failed")
