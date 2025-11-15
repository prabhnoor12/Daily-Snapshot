from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from ..models.setting.model import Setting
from ..schemas.setting.schema import SettingCreate, Setting as SettingSchema

def create_setting(db: Session, setting: SettingCreate) -> Setting:
	db_setting = Setting(
		key=setting.key,
		value=setting.value,
		user_id=setting.user_id
	)
	db.add(db_setting)
	try:
		db.commit()
		db.refresh(db_setting)
	except IntegrityError:
		db.rollback()
		raise ValueError("Setting creation failed due to integrity error.")
	return db_setting

def get_setting_by_id(db: Session, setting_id: int) -> Optional[Setting]:
	return db.query(Setting).filter(Setting.id == setting_id).first()

def get_settings_by_user(db: Session, user_id: int) -> List[Setting]:
	return db.query(Setting).filter(Setting.user_id == user_id).all()

def get_setting_by_key(db: Session, key: str, user_id: Optional[int] = None) -> Optional[Setting]:
	query = db.query(Setting).filter(Setting.key == key)
	if user_id is not None:
		query = query.filter(Setting.user_id == user_id)
	return query.first()

def update_setting(db: Session, setting_id: int, update_data: dict) -> Optional[Setting]:
	setting = get_setting_by_id(db, setting_id)
	if not setting:
		return None
	for key, value in update_data.items():
		setattr(setting, key, value)
	db.commit()
	db.refresh(setting)
	return setting

def delete_setting(db: Session, setting_id: int) -> bool:
	setting = get_setting_by_id(db, setting_id)
	if not setting:
		return False
	db.delete(setting)
	db.commit()
	return True
