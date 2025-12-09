from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger

from my_app.crud.notification_crud import create_notification, get_notifications, mark_as_read, delete_notification
from my_app.schemas.notification_schema import NotificationCreate
from my_app.database import SessionLocal

def send_notification(data):
    db = SessionLocal()
    try:
        notification = NotificationCreate(**data)
        created = create_notification(db, notification)
        return success_response({"notification_id": created.id}, message="Notification sent")
    except Exception as e:
        logger.error(f"Send notification error: {e}")
        return error_response("Failed to send notification")
    finally:
        db.close()

def get_user_notifications(user_id):
    db = SessionLocal()
    try:
        notifications = get_notifications(db, user_id)
        return success_response({"notifications": [n.__dict__ for n in notifications]}, message="Notifications fetched")
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        return error_response("Failed to fetch notifications")
    finally:
        db.close()

def mark_notification_as_read(notification_id):
    db = SessionLocal()
    try:
        notification = mark_as_read(db, notification_id)
        if notification:
            return success_response({"notification_id": notification.id}, message="Notification marked as read")
        else:
            return error_response("Notification not found", status_code=404)
    except Exception as e:
        logger.error(f"Mark as read error: {e}")
        return error_response("Failed to mark notification as read")
    finally:
        db.close()

def remove_notification(notification_id):
    db = SessionLocal()
    try:
        notification = delete_notification(db, notification_id)
        if notification:
            return success_response({"notification_id": notification.id}, message="Notification deleted")
        else:
            return error_response("Notification not found", status_code=404)
    except Exception as e:
        logger.error(f"Delete notification error: {e}")
        return error_response("Failed to delete notification")
    finally:
        db.close()

def send_push_notification(user_id, message):
    # Placeholder: Integrate with push provider (e.g., Firebase, OneSignal)
    try:
        logger.info(f"Push notification sent to user {user_id}: {message}")
        return success_response({"user_id": user_id, "message": message}, message="Push notification sent")
    except Exception as e:
        logger.error(f"Push notification error: {e}")
        return error_response("Failed to send push notification")
