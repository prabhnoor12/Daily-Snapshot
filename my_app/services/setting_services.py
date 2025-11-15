from ..crud.setting_crud import (
	create_setting, get_settings_by_user, get_setting_by_key, update_setting, delete_setting
)
from ..database import SessionLocal
from my_app.middleware.logger import logger

# Example default settings
DEFAULT_SETTINGS = {
	"theme": "light",
	"notifications": True,
	"language": "en",
}


# 1. Settings Validation (extensible, error reporting)
SETTING_VALIDATORS = {
	"theme": lambda v: v in ["light", "dark"],
	"notifications": lambda v: isinstance(v, bool),
	"language": lambda v: v in ["en", "es", "fr"],
}

def validate_setting(key, value):
	if key not in SETTING_VALIDATORS:
		logger.warning(f"Unknown setting key: {key}")
		return False, f"Unknown setting key: {key}"
	valid = SETTING_VALIDATORS[key](value)
	if not valid:
		logger.warning(f"Invalid value for {key}: {value}")
		return False, f"Invalid value for {key}: {value}"
	return True, None


# 2. Default Settings Loader (per-user/shop overrides, bulk onboarding, logging)
def load_default_settings_for_user(user_id, overrides=None):
	db = SessionLocal()
	applied = []
	skipped = []
	try:
		settings_to_apply = DEFAULT_SETTINGS.copy()
		if overrides:
			settings_to_apply.update(overrides)
		for key, value in settings_to_apply.items():
			if not get_setting_by_key(db, key, user_id):
				create_setting(db, {"key": key, "value": value, "user_id": user_id})
				applied.append(key)
			else:
				skipped.append(key)
		logger.info(f"Default settings loaded for user {user_id}. Applied: {applied}, Skipped: {skipped}")
		return {"applied": applied, "skipped": skipped}
	finally:
		db.close()


# 3. Bulk Update (summary, transactional, partial updates)
def bulk_update_settings(user_id, settings_dict, transactional=False):
	db = SessionLocal()
	updated, created, failed = [], [], {}
	try:
		errors = {}
		for key, value in settings_dict.items():
			valid, error = validate_setting(key, value)
			if not valid:
				failed[key] = error
				if transactional:
					db.rollback()
					logger.error(f"Bulk update aborted for user {user_id} due to error: {error}")
					return {"updated": [], "created": [], "failed": failed}
				continue
			setting = get_setting_by_key(db, key, user_id)
			if setting:
				update_setting(db, setting.id, {"value": value})
				updated.append(key)
			else:
				create_setting(db, {"key": key, "value": value, "user_id": user_id})
				created.append(key)
		db.commit()
		logger.info(f"Bulk settings updated for user {user_id}. Updated: {updated}, Created: {created}, Failed: {failed}")
		return {"updated": updated, "created": created, "failed": failed}
	finally:
		db.close()


# 4. Settings Reset (selective, logging, notification stub)
def reset_settings_to_default(user_id, keys=None, notify_user=False):
	db = SessionLocal()
	reset_keys = []
	try:
		user_settings = get_settings_by_user(db, user_id)
		for setting in user_settings:
			if keys and setting.key not in keys:
				continue
			default_value = DEFAULT_SETTINGS.get(setting.key)
			if default_value is not None:
				update_setting(db, setting.id, {"value": default_value})
				reset_keys.append(setting.key)
		logger.info(f"Settings reset to default for user {user_id}. Keys reset: {reset_keys}")
		if notify_user and reset_keys:
			# send_user_notification(user_id, f"Your settings were reset: {reset_keys}")
			logger.info(f"User {user_id} notified of settings reset: {reset_keys}")
		return {"reset": reset_keys}
	finally:
		db.close()



