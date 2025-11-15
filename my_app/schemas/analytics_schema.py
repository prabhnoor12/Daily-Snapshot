from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DailyAnalyticsBase(BaseModel):
    shop_id: int
    date: datetime
    sales: float
    orders: int
    aov: float
    live_visitors: Optional[int] = None
    top_product: Optional[str] = None
    created_at: Optional[datetime] = None

class DailyAnalyticsCreate(DailyAnalyticsBase):
    pass

class DailyAnalytics(DailyAnalyticsBase):
    id: int
    model_config = {
        "from_attributes": True
    }
