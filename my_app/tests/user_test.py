import pytest
from my_app.crud.user_crud import create_user, delete_user, get_user_by_email
from my_app.schemas.user_schema import UserCreate
from my_app.services import user_service
from my_app.models.user_model import User

def test_create_user(db_session):
	user_data = UserCreate(name="Test User", email="testuser@example.com", password="password123")
	user = create_user(db_session, user_data)
	assert user.email == "testuser@example.com"
	# Cleanup
	assert delete_user(db_session, user.id)

def test_set_user_status(db_session):
	user_data = UserCreate(name="Status User", email="statususer@example.com", password="password123")
	user = create_user(db_session, user_data)
	result = user_service.set_user_status(user.id, "active")
	assert result is True
	updated = get_user_by_email(db_session, "statususer@example.com")
	assert updated.status == "active"
	delete_user(db_session, user.id)

def test_suspend_user(db_session):
	user_data = UserCreate(name="Suspend User", email="suspenduser@example.com", password="password123")
	user = create_user(db_session, user_data)
	result = user_service.suspend_user(user.id, reason="Testing suspension")
	assert result is True
	db_session.expire_all()  # Ensure session reloads from DB
	updated = get_user_by_email(db_session, "suspenduser@example.com")
	assert updated.status == "suspended"
	assert updated.suspend_reason == "Testing suspension"
	delete_user(db_session, user.id)

def test_initiate_and_complete_password_reset(db_session):
	user_data = UserCreate(name="Reset User", email="resetuser@example.com", password="password123")
	user = create_user(db_session, user_data)
	token = user_service.initiate_password_reset("resetuser@example.com")
	assert token is not None
	result = user_service.complete_password_reset(token, "newpassword456")
	assert result is True
	# Check password actually changed
	updated = get_user_by_email(db_session, "resetuser@example.com")
	assert updated.reset_token is None
	delete_user(db_session, user.id)

def test_user_endpoints(test_client, db_session):
	# Create user for endpoint tests
	user_data = UserCreate(name="API User", email="apiuser@example.com", password="password123")
	user = create_user(db_session, user_data)
	# Set status
	resp = test_client.post(f"/api/user/status/{user.id}", json={"status": "active"})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Suspend user
	resp = test_client.post(f"/api/user/suspend/{user.id}", json={"reason": "API test"})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Password reset
	resp = test_client.post("/api/user/password-reset/initiate", json={"email": "apiuser@example.com"})
	assert resp.status_code == 200
	token = resp.get_json()["reset_token"]
	assert token is not None
	resp = test_client.post("/api/user/password-reset/complete", json={"token": token, "new_password": "apinewpass"})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Cleanup
	assert delete_user(db_session, user.id)
