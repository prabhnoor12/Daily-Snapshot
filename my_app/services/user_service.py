from ..crud.user_crud import (
	create_user, get_user_by_id, get_user_by_email,
	update_user, delete_user
)
from ..database import SessionLocal
from ..middleware.logger import logger
import secrets
import datetime

# 1. User Status Management
def set_user_status(user_id: int, status: str) -> bool:
	"""
	Set user status: 'active', 'inactive', 'suspended'.
	"""
	db = SessionLocal()
	try:
		user = get_user_by_id(db, user_id)
		if not user:
			logger.warning(f"User not found for status change: {user_id}")
			return False
		update_user(db, user_id, {"status": status})
		logger.info(f"User {user_id} status set to {status}")
		return True
	finally:
		db.close()

def suspend_user(user_id: int, reason: str = None) -> bool:
	"""
	Suspend a user and optionally log a reason.
	"""
	db = SessionLocal()
	try:
		user = get_user_by_id(db, user_id)
		if not user:
			logger.warning(f"User not found for suspension: {user_id}")
			return False
		update_user(db, user_id, {"status": "suspended", "suspend_reason": reason, "suspended_at": datetime.datetime.utcnow()})
		logger.info(f"User {user_id} suspended. Reason: {reason}")
		return True
	finally:
		db.close()

# 2. User Password Reset
def initiate_password_reset(email: str) -> str:
	"""
	Initiate password reset by generating a secure token (stub: store/send as needed).
	"""
	db = SessionLocal()
	try:
		user = get_user_by_email(db, email)
		if not user:
			logger.warning(f"Password reset requested for unknown email: {email}")
			return None
		token = secrets.token_urlsafe(32)
		# Store token in DB or send via email (stub)
		update_user(db, user.id, {"reset_token": token, "reset_requested_at": datetime.datetime.utcnow()})
		logger.info(f"Password reset token generated for user {user.id} ({email})")
		return token
	finally:
		db.close()

def complete_password_reset(token: str, new_password: str) -> bool:
	"""
	Complete password reset using the token and new password.
	"""
	db = SessionLocal()
	try:
		# Find user by reset_token
		from sqlalchemy.orm import Session
		from ..models.user.model import User
		user = db.query(User).filter(User.reset_token == token).first()
		if not user:
			logger.warning(f"Password reset failed: invalid token {token}")
			return False
		# Update password and clear token
		from ..crud.user_crud import get_password_hash
		hashed = get_password_hash(new_password)
		update_user(db, user.id, {"hashed_password": hashed, "reset_token": None, "reset_requested_at": None})
		logger.info(f"Password reset completed for user {user.id}")
		return True
	finally:
		db.close()



