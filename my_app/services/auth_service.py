import os
import hashlib
import hmac
import secrets
import requests
import datetime
from urllib.parse import urlencode
from flask import redirect
from passlib.context import CryptContext
from my_app.crud.user_crud import get_user_by_email, get_password_hash, create_user, update_user
from my_app.utils.jwt_utils import encode_jwt, decode_jwt, verify_jwt, refresh_jwt_token
from my_app.utils.error_handling import AuthError
from my_app.utils.apiResponse import success_response
from my_app.middleware.logger import logger
from my_app.utils.validaion import is_email, is_non_empty_string
from my_app.config.shopify import SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_REDIRECT_URI, SHOPIFY_API_VERSION

def login(email: str, password: str) -> dict:
	if not is_email(email) or not is_non_empty_string(password):
		logger.error(f"Login failed: Invalid input for email {email}")
		raise AuthError("Invalid email or password format.")
	from ..database import SessionLocal
	db = SessionLocal()
	try:
		user = get_user_by_email(db, email)
		if not user or not user.hashed_password:
			logger.warning(f"Login failed: User not found {email}")
			raise AuthError("Invalid credentials.")
		pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
		if not pwd_context.verify(password, user.hashed_password):
			logger.warning(f"Login failed: Incorrect password for {email}")
			raise AuthError("Invalid credentials.")
		token = encode_jwt({"user_id": user.id, "email": user.email}, expires_in=3600)
		logger.info(f"User logged in: {email}")
		return success_response({"token": token, "user": {"id": user.id, "email": user.email}})
	finally:
		db.close()

def logout(token: str) -> dict:
	# For stateless JWT, logout is client-side; optionally blacklist token (not implemented here)
	logger.info(f"User logged out: token {token}")
	return success_response(message="Logged out successfully.")

def refresh_token(token: str) -> dict:
	new_token = refresh_jwt_token(token)
	if not new_token:
		logger.error("Token refresh failed: Invalid or expired token.")
		raise AuthError("Invalid or expired token.")
	logger.info("Token refreshed.")
	return success_response({"token": new_token})

def reset_password(email: str, new_password: str) -> dict:
	if not is_email(email) or not is_non_empty_string(new_password):
		logger.error(f"Password reset failed: Invalid input for email {email}")
		raise AuthError("Invalid email or password format.")
	from ..database import SessionLocal
	db = SessionLocal()
	try:
		user = get_user_by_email(db, email)
		if not user:
			logger.warning(f"Password reset failed: User not found {email}")
			raise AuthError("User not found.")
		hashed = get_password_hash(new_password)
		update_user(db, user.id, {"password": new_password})
		logger.info(f"Password reset for user: {email}")
		return success_response(message="Password reset successful.")
	finally:
		db.close()

def log_user_activity(user_id: int, activity: str) -> None:
	logger.info(f"User Activity: user_id={user_id}, activity={activity}, timestamp={datetime.datetime.utcnow().isoformat()}Z")

def is_token_expired(token: str) -> bool:
	payload = decode_jwt(token)
	if not payload:
		return True
	exp = payload.get("exp")
	if not exp:
		return True
	if isinstance(exp, datetime.datetime):
		return exp < datetime.datetime.utcnow()
	# If exp is timestamp
	try:
		exp_dt = datetime.datetime.utcfromtimestamp(exp)
		return exp_dt < datetime.datetime.utcnow()
	except Exception:
		return True

def generate_state():
	return secrets.token_urlsafe(16)

def build_shopify_oauth_url(shop_domain, state):
	params = {
		'client_id': SHOPIFY_API_KEY,
		'scope': SHOPIFY_SCOPES,
		'redirect_uri': SHOPIFY_REDIRECT_URI,
		'state': state,
		'grant_options[]': 'per-user'
	}
	return f"https://{shop_domain}/admin/oauth/authorize?{urlencode(params)}"

def validate_hmac(params, shopify_secret):
	hmac_received = params.get('hmac')
	params = {k: v for k, v in params.items() if k != 'hmac'}
	sorted_params = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
	hmac_calculated = hmac.new(shopify_secret.encode('utf-8'), sorted_params.encode('utf-8'), hashlib.sha256).hexdigest()
	return hmac.compare_digest(hmac_received, hmac_calculated)

def initiate_shopify_oauth(shop_domain, session):
	state = generate_state()
	session['shopify_oauth_state'] = state
	oauth_url = build_shopify_oauth_url(shop_domain, state)
	return redirect(oauth_url)

def handle_shopify_callback(request_args, session):
	shop = request_args.get('shop')
	code = request_args.get('code')
	state = request_args.get('state')
	hmac_valid = validate_hmac(request_args, SHOPIFY_API_SECRET)
	if not hmac_valid:
		return {'error': 'Invalid HMAC'}, 400
	if state != session.get('shopify_oauth_state'):
		return {'error': 'Invalid state'}, 400
	# Exchange code for access token
	token_url = f"https://{shop}/admin/oauth/access_token"
	payload = {
		'client_id': SHOPIFY_API_KEY,
		'client_secret': SHOPIFY_API_SECRET,
		'code': code
	}
	resp = requests.post(token_url, json=payload)
	if resp.status_code != 200:
		return {'error': 'Failed to get access token'}, 400
	access_data = resp.json()
	access_token = access_data.get('access_token')
	shop_info_url = f"https://{shop}/admin/api/{SHOPIFY_API_VERSION}/shop.json"
	headers = {"X-Shopify-Access-Token": access_token}
	shop_resp = requests.get(shop_info_url, headers=headers)
	if shop_resp.status_code != 200:
		return {'error': 'Failed to fetch shop info'}, 400
	shop_data = shop_resp.json().get('shop', {})

	# Prepare shop data for DB
	db_shop_data = {
		'shop_id': str(shop_data.get('id')),
		'name': shop_data.get('name'),
		'email': shop_data.get('email'),
		'access_token': access_token,
		'domain': shop,
	}

	# Store shop in DB
	from ..database import SessionLocal
	from ..crud.shop_crud import create_shop
	db = SessionLocal()
	try:
		create_shop(db, db_shop_data)
	finally:
		db.close()


	# Create a user for the shop owner if not already present
	from ..crud.user_crud import get_user_by_email, create_user
	from ..schemas.user_schema import UserCreate
	user_email = shop_data.get('email')
	user_name = shop_data.get('shop_owner') or shop_data.get('name') or 'Shopify User'
	db = SessionLocal()
	try:
		existing_user = get_user_by_email(db, user_email)
		if not existing_user:
			# Use a random password since Shopify does not provide one
			import secrets
			random_password = secrets.token_urlsafe(16)
			user_create = UserCreate(name=user_name, email=user_email, password=random_password)
			create_user(db, user_create)
	finally:
		db.close()

	return {'shop': shop, 'access_token': access_token, 'shop_info': shop_data}, 200
