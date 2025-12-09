from sqlalchemy.orm import Session
from my_app.models.analytics_model import DailyAnalytics
from my_app.schemas.analytics_schema import DailyAnalyticsCreate
from typing import Optional, List

def create_daily_analytics(db: Session, analytics_data: dict) -> "DailyAnalytics":
	analytics = DailyAnalytics(**analytics_data)
	db.add(analytics)
	db.commit()
	db.refresh(analytics)
	return analytics

def get_daily_analytics_by_id(db: Session, analytics_id: int) -> Optional["DailyAnalytics"]:
	return db.query(DailyAnalytics).filter(DailyAnalytics.id == analytics_id).first()

def get_daily_analytics_for_shop_and_date(db: Session, shop_id: int, date) -> Optional["DailyAnalytics"]:
	return db.query(DailyAnalytics).filter(DailyAnalytics.shop_id == shop_id, DailyAnalytics.date == date).first()

def get_daily_analytics_for_shop(db: Session, shop_id: int) -> List["DailyAnalytics"]:
	return db.query(DailyAnalytics).filter(DailyAnalytics.shop_id == shop_id).order_by(DailyAnalytics.date.desc()).all()

def update_daily_analytics(db: Session, analytics_id: int, update_data: dict) -> Optional["DailyAnalytics"]:
	analytics = get_daily_analytics_by_id(db, analytics_id)
	if not analytics:
		return None
	for key, value in update_data.items():
		setattr(analytics, key, value)
	db.commit()
	db.refresh(analytics)
	return analytics

def delete_daily_analytics(db: Session, analytics_id: int) -> bool:
	analytics = get_daily_analytics_by_id(db, analytics_id)
	if not analytics:
		return False
	db.delete(analytics)
	db.commit()
	return True
