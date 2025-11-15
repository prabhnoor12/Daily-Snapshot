from sqlalchemy.orm import Session
from passlib.context import CryptContext
from ..models.user.model import User
from ..schemas.user.schema import UserCreate, User
from sqlalchemy.exc import IntegrityError
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise ValueError("Email already registered")
    return db_user

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def update_user(db: Session, user_id: int, update_data: dict) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for key, value in update_data.items():
        if key == "password":
            value = get_password_hash(value)
            key = "hashed_password"
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True
# user_crud.py
"""
CRUD operations for User model
"""
from models.user.model import User
from sqlalchemy.orm import Session

# Create a new user
def create_user(db: Session, user_data: dict) -> User:
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Get a user by ID
def get_user(db: Session, user_id: int) -> User:
    return db.query(User).filter(User.id == user_id).first()

# Update a user
def update_user(db: Session, user_id: int, update_data: dict) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for key, value in update_data.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user

# Delete a user
def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False
