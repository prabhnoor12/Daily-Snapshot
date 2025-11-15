from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from ..models.auth_model import RefreshToken, PasswordResetToken, LoginHistory
from ..schemas.auth_schema import RefreshTokenCreate, PasswordResetTokenCreate, LoginHistoryCreate
from datetime import datetime

def create_refresh_token(db: Session, token_data: RefreshTokenCreate) -> RefreshToken:
    db_token = RefreshToken(**token_data.dict())
    db.add(db_token)
    try:
        db.commit()
        db.refresh(db_token)
    except IntegrityError:
        db.rollback()
        raise ValueError("Refresh token creation failed.")
    return db_token

def get_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()

def revoke_refresh_token(db: Session, token: str) -> bool:
    db_token = get_refresh_token(db, token)
    if not db_token:
        return False
    db_token.revoked = True
    db.commit()
    return True

def create_password_reset_token(db: Session, token_data: PasswordResetTokenCreate) -> PasswordResetToken:
    db_token = PasswordResetToken(**token_data.dict())
    db.add(db_token)
    try:
        db.commit()
        db.refresh(db_token)
    except IntegrityError:
        db.rollback()
        raise ValueError("Password reset token creation failed.")
    return db_token

def get_password_reset_token(db: Session, token: str) -> Optional[PasswordResetToken]:
    return db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()

def mark_password_reset_token_used(db: Session, token: str) -> bool:
    db_token = get_password_reset_token(db, token)
    if not db_token:
        return False
    db_token.used = True
    db.commit()
    return True

def create_login_history(db: Session, history_data: LoginHistoryCreate) -> LoginHistory:
    db_history = LoginHistory(**history_data.dict())
    db.add(db_history)
    try:
        db.commit()
        db.refresh(db_history)
    except IntegrityError:
        db.rollback()
        raise ValueError("Login history creation failed.")
    return db_history

def get_login_history_by_user(db: Session, user_id: int) -> List[LoginHistory]:
    return db.query(LoginHistory).filter(LoginHistory.user_id == user_id).order_by(LoginHistory.login_time.desc()).all()
