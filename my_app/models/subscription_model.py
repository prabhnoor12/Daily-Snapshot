
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
import datetime
from my_app.database import Base

class Subscription(Base):
    __tablename__ = 'subscriptions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    plan = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    active = Column(Boolean, default=True)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    last_charged = Column(DateTime, nullable=True)
    status = Column(String, default="active")
    payment_status = Column(String, default="pending")
    grace_end = Column(DateTime, nullable=True)
