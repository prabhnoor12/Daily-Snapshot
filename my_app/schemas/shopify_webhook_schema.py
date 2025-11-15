from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShopifyWebhookBase(BaseModel):
    shop_id: Optional[int] = None
    shop_domain: str
    event_type: str
    payload: str
    status: Optional[str] = 'received'
    received_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ShopifyWebhookCreate(ShopifyWebhookBase):
    pass

class ShopifyWebhook(ShopifyWebhookBase):
    id: int

    model_config = {
        "from_attributes": True
    }
