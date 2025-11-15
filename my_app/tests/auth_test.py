import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from backend.app import app as flask_app
from backend.services import auth_service

@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

# --- Service Layer Mocks ---
@pytest.fixture(autouse=True)
def mock_auth_service(monkeypatch):
    monkeypatch.setattr(auth_service, "login", lambda email, password: ({"success": True, "token": "fake-token"} if email == "test@example.com" and password == "password" else {"success": False, "error": "Invalid credentials"}))
    monkeypatch.setattr(auth_service, "logout", lambda token: {"success": True, "message": "Logged out successfully."})
    monkeypatch.setattr(auth_service, "refresh_token", lambda token: {"success": True, "token": "new-fake-token"})
    monkeypatch.setattr(auth_service, "reset_password", lambda email, new_password: {"success": True, "message": "Password reset successful."})
    monkeypatch.setattr(auth_service, "initiate_shopify_oauth", lambda shop_domain, session: "redirect-url")
    monkeypatch.setattr(auth_service, "handle_shopify_callback", lambda args, session: ( {"shop": "test", "access_token": "token"}, 200 ))

# --- Endpoint Tests ---
def test_login_success(client):
    response = client.post('/api/auth/login', json={"email": "test@example.com", "password": "password"})
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    assert "token" in response.get_json()

def test_login_failure(client):
    response = client.post('/api/auth/login', json={"email": "wrong@example.com", "password": "wrong"})
    assert response.status_code == 200
    assert response.get_json()["success"] is False

def test_logout(client):
    response = client.post('/api/auth/logout', headers={"Authorization": "Bearer fake-token"})
    assert response.status_code == 200
    assert response.get_json()["success"] is True

def test_refresh_token(client):
    response = client.post('/api/auth/refresh', headers={"Authorization": "Bearer fake-token"})
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    assert "token" in response.get_json()

def test_reset_password(client):
    response = client.post('/api/auth/reset-password', json={"email": "test@example.com", "new_password": "newpass"})
    assert response.status_code == 200
    assert response.get_json()["success"] is True

def test_shopify_oauth_initiate(client):
    response = client.get('/api/auth/shopify/initiate?shop_domain=test.myshopify.com')
    assert response.status_code in (200, 302)

def test_shopify_oauth_callback(client):
    response = client.get('/api/auth/shopify/callback?shop=test.myshopify.com&code=123&state=abc')
    assert response.status_code == 200
    assert "shop" in response.get_json()
    assert "access_token" in response.get_json()
