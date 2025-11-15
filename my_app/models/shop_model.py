from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Shop(Base):
	__tablename__ = 'shops'
	id = Column(Integer, primary_key=True, autoincrement=True)
	shop_id = Column(String, unique=True, nullable=False)
	name = Column(String, nullable=False)
	email = Column(String, nullable=False)
	access_token = Column(String, nullable=False)
	domain = Column(String, nullable=False)
	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
