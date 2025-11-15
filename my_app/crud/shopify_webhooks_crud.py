from sqlalchemy.orm import Session
from ..models.shopify_webhook.model import ShopifyWebhook
from ..schemas.shopify_webhook.schema import ShopifyWebhookCreate
from typing import Optional, List

def create_webhook(db: Session, webhook_data: dict) -> ShopifyWebhook:
	webhook = ShopifyWebhook(**webhook_data)
	db.add(webhook)
	db.commit()
	db.refresh(webhook)
	return webhook

def get_webhook_by_id(db: Session, webhook_id: int) -> Optional[ShopifyWebhook]:
	return db.query(ShopifyWebhook).filter(ShopifyWebhook.id == webhook_id).first()

def get_webhooks_by_shop(db: Session, shop_domain: str) -> List[ShopifyWebhook]:
	return db.query(ShopifyWebhook).filter(ShopifyWebhook.shop_domain == shop_domain).all()

def update_webhook(db: Session, webhook_id: int, update_data: dict) -> Optional[ShopifyWebhook]:
	webhook = get_webhook_by_id(db, webhook_id)
	if not webhook:
		return None
	for key, value in update_data.items():
		setattr(webhook, key, value)
	db.commit()
	db.refresh(webhook)
	return webhook

def delete_webhook(db: Session, webhook_id: int) -> bool:
	webhook = get_webhook_by_id(db, webhook_id)
	if not webhook:
		return False
	db.delete(webhook)
	db.commit()
	return True
