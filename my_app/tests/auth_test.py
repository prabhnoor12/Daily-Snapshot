import pytest
from unittest.mock import patch
from my_app.services import auth_service

def test_login_success(test_client):
	with patch('my_app.services.auth_service.get_user_by_email') as mock_get_user, \
		 patch('my_app.services.auth_service.CryptContext') as mock_pwd_context, \
		 patch('my_app.services.auth_service.encode_jwt') as mock_encode_jwt:
		mock_user = type('User', (), {'id': 1, 'email': 'test@example.com', 'hashed_password': 'hashed'})()
		mock_get_user.return_value = mock_user
		mock_pwd_context.return_value.verify.return_value = True
		mock_encode_jwt.return_value = 'fake-token'
		response = test_client.post('/api/auth/login', json={'email': 'test@example.com', 'password': 'password'})
		assert response.status_code == 200
		assert 'token' in response.get_json()['data']

def test_login_invalid_credentials(test_client):
	with patch('my_app.services.auth_service.get_user_by_email') as mock_get_user:
		mock_get_user.return_value = None
		response = test_client.post('/api/auth/login', json={'email': 'wrong@example.com', 'password': 'password'})
		assert response.status_code == 401 or response.status_code == 400

def test_logout(test_client):
	response = test_client.post('/api/auth/logout', headers={'Authorization': 'Bearer fake-token'})
	assert response.status_code == 200
	assert response.get_json()['message'] == 'Logged out successfully.'

def test_refresh_token_success(test_client):
	with patch('my_app.services.auth_service.refresh_jwt_token') as mock_refresh:
		mock_refresh.return_value = 'new-token'
		response = test_client.post('/api/auth/refresh', headers={'Authorization': 'Bearer fake-token'})
		assert response.status_code == 200
		assert 'token' in response.get_json()['data']

def test_refresh_token_fail(test_client):
	with patch('my_app.services.auth_service.refresh_jwt_token') as mock_refresh:
		mock_refresh.return_value = None
		response = test_client.post('/api/auth/refresh', headers={'Authorization': 'Bearer bad-token'})
		assert response.status_code == 401 or response.status_code == 400

def test_reset_password_success(test_client):
	with patch('my_app.services.auth_service.get_user_by_email') as mock_get_user, \
		 patch('my_app.services.auth_service.get_password_hash') as mock_hash, \
		 patch('my_app.services.auth_service.update_user') as mock_update:
		mock_user = type('User', (), {'id': 1, 'email': 'test@example.com'})()
		mock_get_user.return_value = mock_user
		mock_hash.return_value = 'hashed'
		mock_update.return_value = None
		response = test_client.post('/api/auth/reset-password', json={'email': 'test@example.com', 'new_password': 'newpass'})
		assert response.status_code == 200
		assert response.get_json()['message'] == 'Password reset successful.'

def test_reset_password_user_not_found(test_client):
	with patch('my_app.services.auth_service.get_user_by_email') as mock_get_user:
		mock_get_user.return_value = None
		response = test_client.post('/api/auth/reset-password', json={'email': 'notfound@example.com', 'new_password': 'newpass'})
		assert response.status_code in (400, 401, 404)

def test_shopify_oauth_initiate(test_client):
	with patch('my_app.services.auth_service.initiate_shopify_oauth') as mock_initiate:
		mock_initiate.return_value = ''
		response = test_client.get('/api/auth/shopify/initiate?shop_domain=testshop.myshopify.com')
		assert response.status_code in (200, 302)

def test_shopify_oauth_callback(test_client):
	with patch('my_app.services.auth_service.handle_shopify_callback') as mock_callback:
		mock_callback.return_value = ({'shop': 'testshop', 'access_token': 'token', 'shop_info': {}}, 200)
		response = test_client.get('/api/auth/shopify/callback?shop=testshop&code=123&state=abc&hmac=xyz')
		assert response.status_code == 200
