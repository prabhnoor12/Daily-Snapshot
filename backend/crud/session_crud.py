from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from ..models.session.model import Session as SessionModel
from ..schemas.session.schema import SessionCreate, Session as SessionSchema
from datetime import datetime, timedelta
import secrets

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def create_session(db: Session, session_data: SessionCreate) -> SessionModel:
    session_token = generate_session_token()
    db_session = SessionModel(
        user_id=session_data.user_id,
        session_token=session_token,
        expires_at=session_data.expires_at
    )
    db.add(db_session)
    try:
        db.commit()
        db.refresh(db_session)
    except IntegrityError:
        db.rollback()
        raise ValueError("Session creation failed due to integrity error.")
    return db_session

def get_session_by_id(db: Session, session_id: int) -> Optional[SessionModel]:
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()

def get_session_by_token(db: Session, token: str) -> Optional[SessionModel]:
    return db.query(SessionModel).filter(SessionModel.session_token == token).first()

def get_sessions_by_user(db: Session, user_id: int) -> List[SessionModel]:
    return db.query(SessionModel).filter(SessionModel.user_id == user_id).all()

def update_session(db: Session, session_id: int, update_data: dict) -> Optional[SessionModel]:
    session = get_session_by_id(db, session_id)
    if not session:
        return None
    for key, value in update_data.items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session

def delete_session(db: Session, session_id: int) -> bool:
    session = get_session_by_id(db, session_id)
    if not session:
        return False
    db.delete(session)
    db.commit()
    return True
# session_crud.py
"""
CRUD operations for Session model
"""
from models.session.model import Session as SessionModel
from sqlalchemy.orm import Session

# Create a new session
def create_session(db: Session, session_data: dict) -> SessionModel:
    session = SessionModel(**session_data)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

# Get a session by ID
def get_session(db: Session, session_id: int) -> SessionModel:
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()

# Update a session
def update_session(db: Session, session_id: int, update_data: dict) -> SessionModel:
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session:
        for key, value in update_data.items():
            setattr(session, key, value)
        db.commit()
        db.refresh(session)
    return session

# Delete a session
def delete_session(db: Session, session_id: int) -> bool:
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if session:
        db.delete(session)
        db.commit()
        return True
    return False
