import os
import hashlib
import hmac
import secrets
import requests
from ..config.shopify import SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_REDIRECT_URI, SHOPIFY_API_VERSION
from urllib.parse import urlencode
from flask import redirect

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

	# Optionally, store user info if available (Shopify only provides shop owner email)
	# If you want to create a user record:
	# from ..crud.user_crud import create_user
	# user_data = {
	#     'name': shop_data.get('shop_owner'),
	#     'email': shop_data.get('email'),
	#     'hashed_password': '',  # No password from Shopify
	# }
	# db = SessionLocal()
	# try:
	#     create_user(db, user_data)
	# finally:
	#     db.close()

	return {'shop': shop, 'access_token': access_token, 'shop_info': shop_data}, 200
