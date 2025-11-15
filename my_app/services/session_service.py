
import datetime
from flask import request
from ..crud.session_crud import get_session_by_token, get_sessions_by_user, update_session, delete_session
from ..database import SessionLocal
from ..middleware.logger import logger

# Activity log storage (simple in-memory, replace with DB for production)
session_activity_log = []

# 1. Session Validation (detailed status)
def get_session_status(token: str) -> str:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if not session:
			logger.warning(f"Session validation failed: token={token} (not found)")
			return "not_found"
		if hasattr(session, 'revoked') and session.revoked:
			logger.info(f"Session validation: token={token} (revoked)")
			return "revoked"
		if hasattr(session, 'expires_at') and session.expires_at:
			if session.expires_at < datetime.datetime.utcnow():
				logger.info(f"Session validation: token={token} (expired)")
				return "expired"
		logger.info(f"Session validation: token={token} (active)")
		return "active"
	finally:
		db.close()

# 2. Session Expiry Handling (background job stub)
def cleanup_expired_sessions():
	db = SessionLocal()
	try:
		# This should be run periodically (e.g., Celery, APScheduler)
		# Example: db.query(SessionModel).filter(SessionModel.expires_at < now).delete()
		logger.info("Expired session cleanup triggered.")
		# Notify admin (stub)
		# send_admin_notification("Expired sessions cleaned up.")
	finally:
		db.close()

# 3. Session Activity Logging (with metadata)
def log_session_activity(token: str, activity: str, endpoint: str = None):
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if session:
			log_entry = {
				"session_id": session.id,
				"user_id": session.user_id,
				"activity": activity,
				"ip": request.remote_addr,
				"user_agent": request.headers.get('User-Agent'),
				"endpoint": endpoint or request.endpoint,
				"timestamp": datetime.datetime.utcnow().isoformat() + 'Z'
			}
			session_activity_log.append(log_entry)
			logger.info(f"Session Activity: {log_entry}")
	finally:
		db.close()

# 4. Session Revocation (with reason and notification stub)
def revoke_all_sessions_for_user(user_id: int, reason: str = "user_request") -> int:
	db = SessionLocal()
	try:
		sessions = get_sessions_by_user(db, user_id)
		count = 0
		for session in sessions:
			# Mark as revoked (if model supports it)
			if hasattr(session, 'revoked'):
				update_session(db, session.id, {"revoked": True, "revocation_reason": reason})
			else:
				delete_session(db, session.id)
			count += 1
		logger.info(f"Revoked {count} sessions for user_id={user_id} (reason: {reason})")
		# Notify user (stub)
		# send_user_notification(user_id, f"Your sessions were revoked: {reason}")
		return count
	finally:
		db.close()

# 5. Session Security (configurable strictness, failed binding logging)
def is_session_bound_to_request(token: str, strict_ip: bool = True, strict_ua: bool = True) -> bool:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if not session:
			logger.warning(f"Session binding failed: token={token} (not found)")
			return False
		req_ip = request.remote_addr
		req_ua = request.headers.get('User-Agent')
		ip_match = (getattr(session, 'ip_address', None) == req_ip) if strict_ip else True
		ua_match = (getattr(session, 'user_agent', None) == req_ua) if strict_ua else True
		if not (ip_match and ua_match):
			logger.warning(f"Session binding failed: session_id={session.id}, ip_match={ip_match}, ua_match={ua_match}")
		return ip_match and ua_match
	finally:
		db.close()

# 1. Session Validation
def is_session_active(token: str) -> bool:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if not session:
			return False
		# Assume session has 'expires_at' field
		if hasattr(session, 'expires_at') and session.expires_at:
			return session.expires_at > datetime.datetime.utcnow()
		return True
	finally:
		db.close()

# 2. Session Expiry Handling
def expire_session_if_needed(token: str) -> bool:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if not session:
			return False
		if hasattr(session, 'expires_at') and session.expires_at and session.expires_at < datetime.datetime.utcnow():
			delete_session(db, session.id)
			logger.info(f"Session expired and deleted: {token}")
			return True
		return False
	finally:
		db.close()

# 3. Session Activity Logging
def log_session_activity(token: str, activity: str) -> None:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if session:
			logger.info(f"Session Activity: session_id={session.id}, user_id={session.user_id}, activity={activity}, timestamp={datetime.datetime.utcnow().isoformat()}Z")
	finally:
		db.close()

# 4. Session Revocation (force logout everywhere)
def revoke_all_sessions_for_user(user_id: int) -> int:
	db = SessionLocal()
	try:
		sessions = get_sessions_by_user(db, user_id)
		count = 0
		for session in sessions:
			delete_session(db, session.id)
			count += 1
		logger.info(f"Revoked {count} sessions for user_id={user_id}")
		return count
	finally:
		db.close()

# 5. Session Security (IP/device/user-agent binding)
def is_session_bound_to_request(token: str) -> bool:
	db = SessionLocal()
	try:
		session = get_session_by_token(db, token)
		if not session:
			return False
		# Example: session stores 'ip_address' and 'user_agent'
		req_ip = request.remote_addr
		req_ua = request.headers.get('User-Agent')
		return (getattr(session, 'ip_address', None) == req_ip and getattr(session, 'user_agent', None) == req_ua)
	finally:
		db.close()
