

# Mock SQLAlchemy engine to prevent real DB connections during tests
import pytest
import sys
from unittest.mock import MagicMock
import types
from my_app.database import Base  # Import the real Base

mock_db_module = types.ModuleType("my_app.database")
mock_db_module.engine = MagicMock()
mock_db_module.SessionLocal = MagicMock()
mock_db_module.Base = Base  # Use the real Base
sys.modules["my_app.database"] = mock_db_module

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
