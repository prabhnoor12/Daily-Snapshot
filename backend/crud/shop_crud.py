from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from ..models.shop.model import Shop
from ..schemas.shop.schema import ShopCreate, Shop

def create_shop(db: Session, shop: ShopCreate) -> Shop:
    db_shop = Shop(
        name=shop.name,
        owner_id=shop.owner_id
    )
    db.add(db_shop)
    try:
        db.commit()
        db.refresh(db_shop)
    except IntegrityError:
        db.rollback()
        raise ValueError("Shop creation failed due to integrity error.")
    return db_shop

def get_shop_by_id(db: Session, shop_id: int) -> Optional[Shop]:
    return db.query(Shop).filter(Shop.id == shop_id).first()

def get_shops_by_owner(db: Session, owner_id: int) -> List[Shop]:
    return db.query(Shop).filter(Shop.owner_id == owner_id).all()

def update_shop(db: Session, shop_id: int, update_data: dict) -> Optional[Shop]:
    shop = get_shop_by_id(db, shop_id)
    if not shop:
        return None
    for key, value in update_data.items():
        setattr(shop, key, value)
    db.commit()
    db.refresh(shop)
    return shop

def delete_shop(db: Session, shop_id: int) -> bool:
    shop = get_shop_by_id(db, shop_id)
    if not shop:
        return False
    db.delete(shop)
    db.commit()
    return True
# shop_crud.py
"""
CRUD operations for Shop model
"""
from models.shop.model import Shop
from sqlalchemy.orm import Session

# Create a new shop
def create_shop(db: Session, shop_data: dict) -> Shop:
    shop = Shop(**shop_data)
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop

# Get a shop by ID
def get_shop(db: Session, shop_id: int) -> Shop:
    return db.query(Shop).filter(Shop.id == shop_id).first()

# Update a shop
def update_shop(db: Session, shop_id: int, update_data: dict) -> Shop:
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if shop:
        for key, value in update_data.items():
            setattr(shop, key, value)
        db.commit()
        db.refresh(shop)
    return shop

# Delete a shop
def delete_shop(db: Session, shop_id: int) -> bool:
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if shop:
        db.delete(shop)
        db.commit()
        return True
    return False
