import os

SHOPIFY_API_KEY = os.getenv("SHOPIFY_API_KEY", "your-api-key")
SHOPIFY_API_SECRET = os.getenv("SHOPIFY_API_SECRET", "your-api-secret")
SHOPIFY_API_VERSION = os.getenv("SHOPIFY_API_VERSION", "2023-10")
SHOPIFY_SCOPES = os.getenv("SHOPIFY_SCOPES", "read_products,read_orders")
SHOPIFY_REDIRECT_URI = os.getenv("SHOPIFY_REDIRECT_URI", "https://your-app.com/auth/callback")
