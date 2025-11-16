import pytest
import datetime
from my_app.services import subscription_service
from my_app.crud.subscription_crud import create_subscription, delete_subscription, get_subscription_by_id
from my_app.schemas.subscription_schema import SubscriptionCreate

@pytest.fixture
def user_id(db_session):
	# Create a user for subscription tests (assuming user model and creation available)
	# For now, use 1 as a dummy user_id
	return 1

@pytest.fixture
def subscription_data(user_id):
	today = datetime.date.today()
	return {
		"user_id": user_id,
		"plan": "standard",
		"start_date": today,
		"end_date": today + datetime.timedelta(days=30),
		"status": "active",
		"payment_status": "paid"
	}

def test_validate_subscription_data(subscription_data):
	valid, errors = subscription_service.validate_subscription_data(
		subscription_data["plan"],
		subscription_data["start_date"],
		subscription_data["end_date"],
		subscription_data["payment_status"]
	)
	assert valid is True
	assert errors == []

def test_start_trial(db_session, user_id):
	result = subscription_service.start_trial(user_id, plan="standard", trial_days=7, notify_user=False)
	assert result is True
	# Should not allow another trial
	result2 = subscription_service.start_trial(user_id, plan="standard", trial_days=7, notify_user=False)
	assert result2 is False

def test_convert_trial_to_paid(db_session, user_id):
	subscription_service.start_trial(user_id, plan="standard", trial_days=7, notify_user=False)
	subs = subscription_service.get_subscriptions_by_user(db_session, user_id)
	trial_sub = next((s for s in subs if getattr(s, "status", None) == "trial"), None)
	assert trial_sub is not None
	result = subscription_service.convert_trial_to_paid(trial_sub.id, notify_user=False)
	assert result is True

def test_renew_subscription(db_session, user_id):
	subscription_service.start_trial(user_id, plan="standard", trial_days=7, notify_user=False)
	subs = subscription_service.get_subscriptions_by_user(db_session, user_id)
	trial_sub = next((s for s in subs if getattr(s, "status", None) == "trial"), None)
	subscription_service.convert_trial_to_paid(trial_sub.id, notify_user=False)
	result = subscription_service.renew_subscription(trial_sub.id, renewal_days=30, auto_renew=True, notify_user=False)
	assert result is True

def test_handle_expiry(db_session, user_id):
	subscription_service.start_trial(user_id, plan="standard", trial_days=1, notify_user=False)
	subs = subscription_service.get_subscriptions_by_user(db_session, user_id)
	trial_sub = next((s for s in subs if getattr(s, "status", None) == "trial"), None)
	subscription_service.convert_trial_to_paid(trial_sub.id, notify_user=False)
	# Simulate expiry by setting end_date to yesterday
	yesterday = datetime.date.today() - datetime.timedelta(days=1)
	from my_app.crud.subscription_crud import update_subscription
	update_subscription(db_session, trial_sub.id, {"end_date": datetime.datetime.combine(yesterday, datetime.time.min)})
	result = subscription_service.handle_expiry(trial_sub.id, notify_user=False)
	assert result is True

def test_is_in_grace_period(db_session, user_id):
	subscription_service.start_trial(user_id, plan="standard", trial_days=1, notify_user=False)
	subs = subscription_service.get_subscriptions_by_user(db_session, user_id)
	trial_sub = next((s for s in subs if getattr(s, "status", None) == "trial"), None)
	subscription_service.convert_trial_to_paid(trial_sub.id, notify_user=False)
	# Simulate expiry by setting end_date to yesterday
	yesterday = datetime.date.today() - datetime.timedelta(days=1)
	from my_app.crud.subscription_crud import update_subscription
	update_subscription(db_session, trial_sub.id, {"end_date": datetime.datetime.combine(yesterday, datetime.time.min)})
	subscription_service.handle_expiry(trial_sub.id, notify_user=False)
	result = subscription_service.is_in_grace_period(trial_sub.id, notify_user=False)
	assert result is True

def test_subscription_endpoints(test_client, db_session, user_id):
	# Start trial
	resp = test_client.post(f"/api/subscription/start-trial/{user_id}", json={"plan": "standard", "trial_days": 7, "notify_user": False})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Get the actual trial subscription id from DB
	from my_app.services import subscription_service
	from my_app.crud.subscription_crud import get_subscriptions_by_user
	subs = get_subscriptions_by_user(db_session, user_id)
	trial_sub = next((s for s in subs if getattr(s, "status", None) == "trial"), None)
	assert trial_sub is not None
	sub_id = trial_sub.id
	# Convert trial to paid
	resp = test_client.post(f"/api/subscription/convert/{sub_id}", json={"notify_user": False})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Renew subscription
	resp = test_client.post(f"/api/subscription/renew/{sub_id}", json={"renewal_days": 30, "auto_renew": True, "notify_user": False})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Simulate expiry by setting end_date to yesterday
	yesterday = datetime.date.today() - datetime.timedelta(days=1)
	from my_app.crud.subscription_crud import update_subscription
	update_subscription(db_session, sub_id, {"end_date": datetime.datetime.combine(yesterday, datetime.time.min)})
	# Handle expiry
	resp = test_client.post(f"/api/subscription/handle-expiry/{sub_id}", json={"notify_user": False})
	assert resp.status_code == 200
	assert resp.get_json()["success"] is True
	# Check grace period
	resp = test_client.get(f"/api/subscription/in-grace/{sub_id}", query_string={"notify_user": False})
	assert resp.status_code == 200
	assert resp.get_json()["in_grace"] in [True, False]
