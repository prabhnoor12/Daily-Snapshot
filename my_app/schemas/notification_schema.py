from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: int
    message: str
    type: Optional[str] = 'in-app'
    status: Optional[str] = 'unread'
    is_active: Optional[bool] = True

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
