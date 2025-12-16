import requests

from my_app.config.shopify import SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_VERSION
from typing import Optional, List, Dict, Any
import datetime

def _shopify_headers(access_token: str) -> Dict[str, str]:
    return {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json"
    }

def get_shopify_orders(shop_domain: str, access_token: str, start_date: Optional[str]=None, end_date: Optional[str]=None) -> List[Dict[str, Any]]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/orders.json"
    params = {
        "status": "any",
        "created_at_min": start_date,
        "created_at_max": end_date,
        "fields": "id,line_items,created_at,total_price,financial_status,fulfillment_status,customer"
    }
    response = requests.get(url, headers=_shopify_headers(access_token), params={k: v for k, v in params.items() if v})
    response.raise_for_status()
    return response.json().get("orders", [])

def get_shopify_products(shop_domain: str, access_token: str, updated_at_min: Optional[str]=None, updated_at_max: Optional[str]=None) -> List[Dict[str, Any]]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/products.json"
    params = {
        "updated_at_min": updated_at_min,
        "updated_at_max": updated_at_max,
        "fields": "id,title,variants,created_at,updated_at,product_type"
    }
    response = requests.get(url, headers=_shopify_headers(access_token), params={k: v for k, v in params.items() if v})
    response.raise_for_status()
    return response.json().get("products", [])

def get_shopify_customers(shop_domain: str, access_token: str, created_at_min: Optional[str]=None, created_at_max: Optional[str]=None) -> List[Dict[str, Any]]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/customers.json"
    params = {
        "created_at_min": created_at_min,
        "created_at_max": created_at_max,
        "fields": "id,first_name,last_name,email,created_at,orders_count,total_spent"
    }
    response = requests.get(url, headers=_shopify_headers(access_token), params={k: v for k, v in params.items() if v})
    response.raise_for_status()
    return response.json().get("customers", [])

def get_shopify_shop_info(shop_domain: str, access_token: str) -> Dict[str, Any]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/shop.json"
    response = requests.get(url, headers=_shopify_headers(access_token))
    response.raise_for_status()
    return response.json().get("shop", {})

def get_shopify_inventory_levels(shop_domain: str, access_token: str, location_ids: Optional[List[str]]=None) -> List[Dict[str, Any]]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/inventory_levels.json"
    params = {"location_ids": ",".join(location_ids) if location_ids else None}
    response = requests.get(url, headers=_shopify_headers(access_token), params={k: v for k, v in params.items() if v})
    response.raise_for_status()
    return response.json().get("inventory_levels", [])

def get_shopify_abandoned_checkouts(shop_domain: str, access_token: str, since_id: Optional[str]=None) -> List[Dict[str, Any]]:
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/checkouts.json"
    params = {"since_id": since_id} if since_id else {}
    response = requests.get(url, headers=_shopify_headers(access_token), params=params)
    response.raise_for_status()
    return response.json().get("checkouts", [])

# Analytics helpers
def calculate_total_sales(orders: List[Dict[str, Any]]) -> float:
    return sum(float(order.get("total_price", 0)) for order in orders)

def calculate_average_order_value(orders: List[Dict[str, Any]]) -> float:
    if not orders:
        return 0.0
    return calculate_total_sales(orders) / len(orders)

def get_top_products(orders: List[Dict[str, Any]], top_n: int = 3) -> List[Dict[str, Any]]:
    product_sales = {}
    for order in orders:
        for item in order.get("line_items", []):
            pid = item["product_id"]
            product_sales.setdefault(pid, {"title": item.get("title"), "quantity": 0, "sales": 0.0})
            product_sales[pid]["quantity"] += item.get("quantity", 0)
            product_sales[pid]["sales"] += float(item.get("price", 0)) * item.get("quantity", 0)
    return sorted(product_sales.values(), key=lambda x: x["sales"], reverse=True)[:top_n]

# Export helpers (stubs)
def export_orders_to_csv(orders: List[Dict[str, Any]]) -> str:
    import csv
    import io
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=orders[0].keys() if orders else [])
    writer.writeheader()
    writer.writerows(orders)
    return output.getvalue()
