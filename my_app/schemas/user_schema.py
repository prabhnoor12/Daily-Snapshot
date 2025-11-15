from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
	name: str
	email: EmailStr

class UserCreate(UserBase):
	password: str

class User(UserBase):
	id: int
	created_at: datetime

	model_config = {
		"from_attributes": True
	}
