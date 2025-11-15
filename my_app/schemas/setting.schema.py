from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SettingBase(BaseModel):
	key: str
	value: str
	user_id: Optional[int] = None

class SettingCreate(SettingBase):
	pass

class Setting(SettingBase):
	id: int
	created_at: datetime
	updated_at: datetime

	class Config:
		orm_mode = True
