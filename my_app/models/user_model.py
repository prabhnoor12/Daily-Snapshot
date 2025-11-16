from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String, nullable=False)
	email = Column(String, unique=True, index=True, nullable=False)
	hashed_password = Column(String, nullable=False)
	created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.UTC))
	status = Column(String, default="active")
	reset_token = Column(String, nullable=True)
	reset_requested_at = Column(DateTime, nullable=True)
	suspend_reason = Column(String, nullable=True)
	suspended_at = Column(DateTime, nullable=True)

	sessions = relationship("Session", back_populates="user")
	settings = relationship("Setting", back_populates="user")
