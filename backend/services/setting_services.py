"""
Business logic for settings operations. Data access is delegated to setting_crud.
"""
from ..crud.setting_crud import (
	create_setting, get_setting_by_id, get_settings_by_user,
	get_setting_by_key, update_setting, delete_setting
)
from ..database import SessionLocal

def create_user_setting(setting_data):
	db = SessionLocal()
	try:
		return create_setting(db, setting_data)
	finally:
		db.close()

def get_user_settings(user_id):
	db = SessionLocal()
	try:
		return get_settings_by_user(db, user_id)
	finally:
		db.close()
