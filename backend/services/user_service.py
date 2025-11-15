"""
Business logic for user operations. Data access is delegated to user_crud.
"""
from ..crud.user_crud import (
	create_user, get_user_by_id, get_user_by_email,
	update_user, delete_user
)
from ..database import SessionLocal

def register_user(user_data):
	db = SessionLocal()
	try:
		return create_user(db, user_data)
	finally:
		db.close()

def get_user(user_id):
	db = SessionLocal()
	try:
		return get_user_by_id(db, user_id)
	finally:
		db.close()
