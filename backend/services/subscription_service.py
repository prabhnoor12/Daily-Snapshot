"""
Business logic for subscription operations. Data access is delegated to subscription_crud.
"""
from ..crud.subscription_crud import (
	create_subscription, get_subscription_by_id, get_subscriptions_by_user,
	update_subscription, delete_subscription
)
from ..database import SessionLocal

def create_new_subscription(subscription_data):
	db = SessionLocal()
	try:
		return create_subscription(db, subscription_data)
	finally:
		db.close()

def get_subscription(subscription_id):
	db = SessionLocal()
	try:
		return get_subscription_by_id(db, subscription_id)
	finally:
		db.close()
