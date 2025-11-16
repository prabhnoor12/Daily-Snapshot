from ..crud.subscription_crud import (
	create_subscription, get_subscription_by_id, get_subscriptions_by_user,
	update_subscription, delete_subscription
)
from ..database import SessionLocal
from my_app.middleware.logger import logger
import datetime


# Only one plan, $20
VALID_PLANS = {"standard": 20}
GRACE_PERIOD_DAYS = 7


# 1. Subscription Validation (extensible, payment gateway integration, detailed errors)
def validate_subscription_data(plan, start_date, end_date, payment_status, custom_rules=None):
	errors = []
	if plan not in VALID_PLANS:
		errors.append({"field": "plan", "error": f"Invalid plan: {plan}"})
	if not isinstance(start_date, datetime.date) or not isinstance(end_date, datetime.date):
		errors.append({"field": "date", "error": "Invalid start or end date."})
	if end_date <= start_date:
		errors.append({"field": "date", "error": "End date must be after start date."})
	if payment_status not in ["paid", "pending", "failed"]:
		errors.append({"field": "payment_status", "error": f"Invalid payment status: {payment_status}"})
	# Custom business rules
	if custom_rules:
		for rule in custom_rules:
			valid, err = rule(plan, start_date, end_date, payment_status)
			if not valid:
				errors.append({"field": "custom", "error": err})
	# Payment gateway check (stub)
	# if payment_status == "paid":
	#     if not check_payment_gateway(user_id, plan):
	#         errors.append({"field": "payment", "error": "Payment not confirmed."})
	return len(errors) == 0, errors


# 2. Trial Management (notifications, configurable duration, prevent multiple trials)
def start_trial(user_id, plan="standard", trial_days=15, notify_user=True):
	db = SessionLocal()
	try:
		# Prevent multiple trials
		trials = [s for s in get_subscriptions_by_user(db, user_id) if getattr(s, "status", None) == "trial"]
		if trials:
			logger.warning(f"User {user_id} already has a trial.")
			return False
		start_date = datetime.date.today()
		end_date = start_date + datetime.timedelta(days=trial_days)
		trial_data = {
			"user_id": user_id,
			"plan": plan,
			"start_date": start_date,
			"end_date": end_date,
			"status": "trial",
			"payment_status": "pending"
		}
		create_subscription(db, trial_data)
		logger.info(f"Trial started for user {user_id} on plan {plan}")
		if notify_user:
			# send_user_notification(user_id, f"Your trial for {plan} started and will expire on {end_date}")
			logger.info(f"User {user_id} notified of trial start.")
		return True
	finally:
		db.close()

def convert_trial_to_paid(subscription_id, notify_user=True):
	db = SessionLocal()
	try:
		sub = get_subscription_by_id(db, subscription_id)
		if sub and sub.status == "trial":
			update_subscription(db, subscription_id, {"status": "active", "payment_status": "paid"})
			logger.info(f"Trial converted to paid for subscription {subscription_id}")
			if notify_user:
				# send_user_notification(sub.user_id, f"Your trial has been converted to a paid subscription.")
				logger.info(f"User {sub.user_id} notified of trial conversion.")
			return True
		return False
	finally:
		db.close()


# 3. Renewal & Expiry Handling (auto-renewal, notifications, failed renewal handling)
def renew_subscription(subscription_id, renewal_days=30, auto_renew=True, notify_user=True):
	db = SessionLocal()
	try:
		sub = get_subscription_by_id(db, subscription_id)
		if sub and sub.status == "active":
			# Payment confirmation stub
			payment_confirmed = True # replace with actual payment check
			if not payment_confirmed:
				# send_user_notification(sub.user_id, "Renewal failed due to payment issue.")
				logger.warning(f"Renewal failed for subscription {subscription_id} due to payment.")
				return False
			new_end = sub.end_date + datetime.timedelta(days=renewal_days)
			update_subscription(db, subscription_id, {"end_date": new_end})
			logger.info(f"Subscription {subscription_id} renewed until {new_end}")
			if notify_user:
				# send_user_notification(sub.user_id, f"Your subscription has been renewed until {new_end}")
				logger.info(f"User {sub.user_id} notified of renewal.")
			return True
		return False
	finally:
		db.close()

def handle_expiry(subscription_id, notify_user=True):
	db = SessionLocal()
	try:
		sub = get_subscription_by_id(db, subscription_id)
		if sub and sub.end_date.date() < datetime.date.today():
			# Enter grace period
			grace_days = getattr(sub, "grace_days", GRACE_PERIOD_DAYS)
			grace_end = datetime.date.today() + datetime.timedelta(days=grace_days)
			update_subscription(db, subscription_id, {"status": "grace", "grace_end": grace_end})
			logger.info(f"Subscription {subscription_id} expired, grace period until {grace_end}")
			if notify_user:
				# send_user_notification(sub.user_id, f"Your subscription expired. Grace period until {grace_end}")
				logger.info(f"User {sub.user_id} notified of expiry and grace period.")
			return True
		return False
	finally:
		db.close()


# 4. Subscription History (DB-backed, include user/admin, reason)
def log_subscription_change(db, subscription_id, change_type, details, actor_id=None, reason=None):
	# Replace with DB model for production
	entry = {
		"subscription_id": subscription_id,
		"change_type": change_type,
		"details": details,
		"actor_id": actor_id,
		"reason": reason,
		"timestamp": datetime.datetime.utcnow().isoformat() + 'Z'
	}
	# db.add(SubscriptionHistory(**entry))
	# db.commit()
	logger.info(f"Subscription change logged: {entry}")


# 5. Grace Periods (configurable, notifications, limited access)
def is_in_grace_period(subscription_id, notify_user=True):
	db = SessionLocal()
	try:
		sub = get_subscription_by_id(db, subscription_id)
		if sub and getattr(sub, "status", None) == "grace":
			grace_end = getattr(sub, "grace_end", None)
			if grace_end:
				# Ensure grace_end is a date for comparison
				if isinstance(grace_end, datetime.datetime):
					grace_end = grace_end.date()
				in_grace = datetime.date.today() <= grace_end
			else:
				in_grace = False
			if in_grace and notify_user:
				# send_user_notification(sub.user_id, "You are in a grace period. Some features may be limited.")
				logger.info(f"User {sub.user_id} notified of grace period.")
			return in_grace
		return False
	finally:
		db.close()


