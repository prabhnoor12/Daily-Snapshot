"""
Business logic for session operations. Data access is delegated to session_crud.
"""
from ..crud.session_crud import (
	create_session, get_session_by_id, get_session_by_token,
	get_sessions_by_user, update_session, delete_session, generate_session_token
)
from ..database import SessionLocal

def create_new_session(session_data):
	db = SessionLocal()
	try:
		return create_session(db, session_data)
	finally:
		db.close()

def get_session(session_id):
	db = SessionLocal()
	try:
		return get_session_by_id(db, session_id)
	finally:
		db.close()

def invalidate_session(session_id):
	db = SessionLocal()
	try:
		return delete_session(db, session_id)
	finally:
		db.close()
