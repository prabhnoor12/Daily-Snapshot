from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
	name: str
	owner_id: int

class ShopCreate(ShopBase):
	pass

class Shop(ShopBase):
	id: int
	created_at: datetime

	class Config:
		orm_mode = True
