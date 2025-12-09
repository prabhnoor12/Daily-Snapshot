from my_app.models.notification_model import Notification
from my_app.schemas.notification_schema import NotificationCreate
from sqlalchemy.orm import Session
from datetime import datetime

def create_notification(db: Session, notification: NotificationCreate):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_active == True).all()

def mark_as_read(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.status = 'read'
        db.commit()
        db.refresh(notification)
    return notification

def delete_notification(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_active = False
        db.commit()
        db.refresh(notification)
    return notification
