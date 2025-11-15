import hmac
import hashlib
from ..schemas.shopify_webhook.schema import ShopifyWebhookCreate
from ..crud.shopify_webhooks_crud import create_webhook, update_webhook
from ..config.shopify import SHOPIFY_API_SECRET
from pydantic import ValidationError
from ..middleware.logger import logger

def verify_shopify_webhook(request_headers, request_data) -> bool:
	"""
	Validate Shopify webhook HMAC signature.
	"""
	hmac_header = request_headers.get('X-Shopify-Hmac-Sha256')
	calculated_hmac = hmac.new(
		SHOPIFY_API_SECRET.encode('utf-8'),
		request_data,
		hashlib.sha256
	).digest()
	import base64
	calculated_hmac_b64 = base64.b64encode(calculated_hmac).decode()
	valid = hmac.compare_digest(hmac_header, calculated_hmac_b64)
	logger.info(f"Webhook verification: {valid}")
	return valid

def parse_and_validate_webhook_payload(payload: dict) -> ShopifyWebhookCreate:
	try:
		webhook_obj = ShopifyWebhookCreate(**payload)
		return webhook_obj
	except ValidationError as e:
		logger.error(f"Webhook payload validation failed: {e}")
		raise e

# Event Routing
def route_webhook_event(webhook_obj: ShopifyWebhookCreate):
	event_type = webhook_obj.event_type
	if event_type == 'orders/create':
		handle_order_created(webhook_obj)
	elif event_type == 'app/uninstalled':
		handle_app_uninstalled(webhook_obj)
	else:
		handle_generic_event(webhook_obj)

def handle_order_created(webhook_obj):
	logger.info(f"Order created event: {webhook_obj.payload}")
	# ...business logic...

def handle_app_uninstalled(webhook_obj):
	logger.info(f"App uninstalled event: {webhook_obj.shop_domain}")
	# ...business logic...

def handle_generic_event(webhook_obj):
	logger.info(f"Generic event: {webhook_obj.event_type}")
	# ...business logic...

# Retry Logic
from ..database import SessionLocal
def process_webhook_with_retry(webhook_data, max_retries=3):
	db_result = None
	db = SessionLocal()
	try:
		for attempt in range(1, max_retries + 1):
			try:
				webhook_obj = parse_and_validate_webhook_payload(webhook_data)
				db_result = create_webhook(db, webhook_obj.dict())
				route_webhook_event(webhook_obj)
				update_webhook(db, db_result.id, {"status": "processed"})
				logger.info(f"Webhook processed successfully on attempt {attempt}")
				break
			except Exception as e:
				logger.error(f"Webhook processing failed on attempt {attempt}: {e}")
				if db_result:
					update_webhook(db, db_result.id, {"status": "failed", "error_message": str(e)})
		return db_result
	finally:
		db.close()

# Webhook Logging
def log_webhook_event(webhook_obj, status):
	logger.info(f"Webhook event logged: shop={webhook_obj.shop_domain}, event={webhook_obj.event_type}, status={status}")
