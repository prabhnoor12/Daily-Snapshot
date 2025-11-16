from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from my_app.models.subscription_model import Subscription
from my_app.schemas.subscription_schema import SubscriptionCreate

def create_subscription(db: Session, subscription: SubscriptionCreate) -> Subscription:
    # Accept dict or SubscriptionCreate
    if isinstance(subscription, dict):
        db_subscription = Subscription(
            user_id=subscription.get("user_id"),
            plan=subscription.get("plan"),
            price=20.0,  # default price for standard plan
            active=True,
            start_date=subscription.get("start_date"),
            end_date=subscription.get("end_date"),
            status=subscription.get("status", "active"),
            payment_status=subscription.get("payment_status", "pending"),
            grace_end=subscription.get("grace_end"),
        )
    else:
        db_subscription = Subscription(
            user_id=subscription.user_id,
            plan=subscription.plan,
            price=20.0,
            active=True,
            start_date=getattr(subscription, "start_date", None),
            end_date=getattr(subscription, "end_date", None),
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
