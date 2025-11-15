from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from ..models.subscription.model import Subscription
from ..schemas.subscription.schema import SubscriptionCreate, Subscription

def create_subscription(db: Session, subscription: SubscriptionCreate) -> Subscription:
    db_subscription = Subscription(
        user_id=subscription.user_id,
        plan=subscription.plan,
        is_active=subscription.is_active
    )
    db.add(db_subscription)
    try:
        db.commit()
        db.refresh(db_subscription)
    except IntegrityError:
        db.rollback()
        raise ValueError("Subscription creation failed due to integrity error.")
    return db_subscription

def get_subscription_by_id(db: Session, subscription_id: int) -> Optional[Subscription]:
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()

def get_subscriptions_by_user(db: Session, user_id: int) -> List[Subscription]:
    return db.query(Subscription).filter(Subscription.user_id == user_id).all()

def update_subscription(db: Session, subscription_id: int, update_data: dict) -> Optional[Subscription]:
    subscription = get_subscription_by_id(db, subscription_id)
    if not subscription:
        return None
    for key, value in update_data.items():
        setattr(subscription, key, value)
    db.commit()
    db.refresh(subscription)
    return subscription

def delete_subscription(db: Session, subscription_id: int) -> bool:
    subscription = get_subscription_by_id(db, subscription_id)
    if not subscription:
        return False
    db.delete(subscription)
    db.commit()
    return True
# subscription_crud.py
"""
CRUD operations for Subscription model
"""
from models.subscription.model import Subscription
from sqlalchemy.orm import Session

# Create a new subscription
def create_subscription(db: Session, subscription_data: dict) -> Subscription:
    subscription = Subscription(**subscription_data)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

# Get a subscription by ID
def get_subscription(db: Session, subscription_id: int) -> Subscription:
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()

# Update a subscription
def update_subscription(db: Session, subscription_id: int, update_data: dict) -> Subscription:
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if subscription:
        for key, value in update_data.items():
            setattr(subscription, key, value)
        db.commit()
        db.refresh(subscription)
    return subscription

# Delete a subscription
def delete_subscription(db: Session, subscription_id: int) -> bool:
    subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if subscription:
        db.delete(subscription)
        db.commit()
        return True
    return False
