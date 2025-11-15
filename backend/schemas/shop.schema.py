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
from marshmallow import Schema, fields

class ShopSchema(Schema):
	id = fields.Int(dump_only=True)
	shop_id = fields.Str(required=True)
	name = fields.Str(required=True)
	email = fields.Email(required=True)
	access_token = fields.Str(required=True)
	domain = fields.Str(required=True)
	created_at = fields.DateTime(dump_only=True)
	updated_at = fields.DateTime(dump_only=True)
