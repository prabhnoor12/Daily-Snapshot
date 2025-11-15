
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class DailyAnalytics(Base):
    __tablename__ = 'daily_analytics'
    id = Column(Integer, primary_key=True, autoincrement=True)
    shop_id = Column(Integer, ForeignKey('shops.id'), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    sales = Column(Float, nullable=False)
    orders = Column(Integer, nullable=False)
    aov = Column(Float, nullable=False)
    live_visitors = Column(Integer, nullable=True)
    top_product = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
