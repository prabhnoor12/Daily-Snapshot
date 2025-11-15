from sqlalchemy.orm import Session
from my_app.models.shop_model import Shop

def create_shop(db: Session, shop_data: dict) -> Shop:
    shop = Shop(**shop_data)
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop

def get_shop(db: Session, shop_id: int) -> Shop:
    return db.query(Shop).filter(Shop.id == shop_id).first()

def update_shop(db: Session, shop_id: int, update_data: dict) -> Shop:
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if shop:
        for key, value in update_data.items():
            setattr(shop, key, value)
        db.commit()
        db.refresh(shop)
    return shop

def delete_shop(db: Session, shop_id: int) -> bool:
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if shop:
        db.delete(shop)
        db.commit()
        return True
    return False
