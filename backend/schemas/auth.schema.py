from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RefreshTokenBase(BaseModel):
    user_id: int
    token: str
    expires_at: datetime
    revoked: bool = False

class RefreshTokenCreate(RefreshTokenBase):
    pass

class RefreshToken(RefreshTokenBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class PasswordResetTokenBase(BaseModel):
    user_id: int
    token: str
    expires_at: datetime
    used: bool = False

class PasswordResetTokenCreate(PasswordResetTokenBase):
    pass

class PasswordResetToken(PasswordResetTokenBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class LoginHistoryBase(BaseModel):
    user_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class LoginHistoryCreate(LoginHistoryBase):
    pass

class LoginHistory(LoginHistoryBase):
    id: int
    login_time: datetime
    class Config:
        orm_mode = True
