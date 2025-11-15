from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class ShopifyWebhook(Base):
    __tablename__ = 'shopify_webhooks'
    id = Column(Integer, primary_key=True, autoincrement=True)
    shop_domain = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    payload = Column(Text, nullable=False)
    status = Column(String, default='received')
    received_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
