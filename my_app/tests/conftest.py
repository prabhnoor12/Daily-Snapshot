import pytest
from my_app.database import Base, engine
# Import all models so they are registered with Base
from my_app.models.shop_model import Shop
from my_app.models.analytics_model import DailyAnalytics
from my_app.models.shopify_webhook_model import ShopifyWebhook
from my_app.models.subscription_model import Subscription
from my_app.models.auth_model import RefreshToken, PasswordResetToken, LoginHistory
from my_app.models.session_model import Session
from my_app.models.setting_model import Setting

@pytest.fixture(scope='session', autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

import pytest
from flask import Flask
from my_app.app import app as flask_app
from my_app.database import SessionLocal
from my_app.models.shop_model import Shop


@pytest.fixture(scope='module')
def test_client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

@pytest.fixture(scope='function')
def db_session():
    db = SessionLocal()
    yield db
    db.close()

@pytest.fixture(scope='function')
def test_shop(db_session):
    shop = Shop(shop_id="test_shop_id", name="Test Shop", email="test@example.com", access_token="token", domain="testshop.com")
    db_session.add(shop)
    db_session.commit()
    yield shop
    db_session.delete(shop)
    db_session.commit()
