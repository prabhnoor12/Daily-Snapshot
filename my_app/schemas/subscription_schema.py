from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubscriptionBase(BaseModel):
	user_id: int
	plan: str
	is_active: bool

class SubscriptionCreate(SubscriptionBase):
	pass

class Subscription(SubscriptionBase):
	id: int
	created_at: datetime

	class Config:
		orm_mode = True
