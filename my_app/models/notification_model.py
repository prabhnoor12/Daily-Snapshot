from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default='in-app')  # in-app, email, sms
    status = Column(String, default='unread')  # unread, read
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
