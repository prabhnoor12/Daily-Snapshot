import pytest
import base64
import hmac
import hashlib
import json
from my_app.services import shopify_webhooks
from my_app.config.shopify import SHOPIFY_API_SECRET
from my_app.crud.shopify_webhooks_crud import get_webhook_by_id, delete_webhook
from my_app.schemas.shopify_webhook_schema import ShopifyWebhookCreate

def generate_hmac(data: bytes) -> str:
	hmac_digest = hmac.new(SHOPIFY_API_SECRET.encode('utf-8'), data, hashlib.sha256).digest()
	return base64.b64encode(hmac_digest).decode()

@pytest.fixture
def webhook_payload():
	return {
		"shop_id": 1,
		"shop_domain": "testshop.com",
		"event_type": "orders/create",
		"payload": json.dumps({"order_id": 123, "amount": 99.99}),
		"status": "received"
	}

def test_verify_shopify_webhook_signature(webhook_payload):
	data = json.dumps(webhook_payload).encode()
	hmac_header = generate_hmac(data)
	headers = {"X-Shopify-Hmac-Sha256": hmac_header}
	assert shopify_webhooks.verify_shopify_webhook(headers, data) is True
	# Invalid signature
	headers["X-Shopify-Hmac-Sha256"] = "invalid"
	assert shopify_webhooks.verify_shopify_webhook(headers, data) is False

def test_parse_and_validate_webhook_payload(webhook_payload):
	obj = shopify_webhooks.parse_and_validate_webhook_payload(webhook_payload)
	assert obj.shop_domain == "testshop.com"
	assert obj.event_type == "orders/create"

def test_process_webhook_with_retry(db_session, webhook_payload):
	result = shopify_webhooks.process_webhook_with_retry(webhook_payload)
	assert result is not None
	fetched = get_webhook_by_id(db_session, result.id)
	assert fetched.status == "processed"
	assert fetched.shop_domain == "testshop.com"
	assert delete_webhook(db_session, result.id)

def test_shopify_webhook_endpoint(test_client, webhook_payload):
	data = json.dumps(webhook_payload).encode()
	hmac_header = generate_hmac(data)
	headers = {"X-Shopify-Hmac-Sha256": hmac_header, "Content-Type": "application/json"}
	resp = test_client.post("/api/webhook/shopify", data=data, headers=headers)
	assert resp.status_code == 200
	resp_json = resp.get_json()
	assert resp_json["status"] == "processed"
	assert resp_json["id"] is not None
