import pytest
from unittest.mock import patch
from my_app.services import analytics_service
from datetime import datetime

def test_day_over_day_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.side_effect = [type('Analytics', (), {'sales': 100, 'orders': 10, 'live_visitors': 5})(), type('Analytics', (), {'sales': 80, 'orders': 8, 'live_visitors': 3})()]
		response = test_client.get(f'/api/analytics/day-over-day/{test_shop.id}')
		assert response.status_code == 200
		data = response.get_json()['data']
		assert data['today']['sales'] == 100
		assert data['yesterday']['sales'] == 80

def test_7_day_trends_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop') as mock_get:
		mock_get.return_value = [type('Analytics', (), {
			'date': datetime(2025, 11, 15).date(),
			'sales': 100,
			'orders': 10,
			'live_visitors': 5,
			'aov': 50,
			'top_product': 'A'
		})() for _ in range(7)]
		response = test_client.get(f'/api/analytics/7-day-trends/{test_shop.id}')
		assert response.status_code == 200
		assert 'sales' in response.get_json()['data']

def test_top_products_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'top_product': 'A,B,C'})()
		response = test_client.get(f'/api/analytics/top-products/{test_shop.id}?top_n=2')
		assert response.status_code == 200
		assert len(response.get_json()['data']) == 2

def test_order_status_endpoint(test_client, test_shop):
	response = test_client.get(f'/api/analytics/order-status/{test_shop.id}')
	assert response.status_code == 200
	assert 'fulfilled' in response.get_json()['data']

def test_real_time_visitors_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'live_visitors': 7})()
		response = test_client.get(f'/api/analytics/real-time-visitors/{test_shop.id}')
		assert response.status_code == 200
		assert response.get_json()['data']['live_visitors'] == 7

def test_aov_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'aov': 123.45})()
		response = test_client.get(f'/api/analytics/aov/{test_shop.id}')
		assert response.status_code == 200
		assert response.get_json()['data']['aov'] == 123.45

def test_export_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {
			'date': datetime(2025, 11, 15).date(),
			'sales': 100,
			'orders': 10,
			'aov': 50,
			'live_visitors': 5,
			'top_product': 'A'
		})()
		response = test_client.get(f'/api/analytics/export/{test_shop.id}?format=csv')
		assert response.status_code == 200
		assert 'csv' in response.get_json()['data']

def test_custom_dashboard_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'sales': 100, 'orders': 10, 'aov': 50, 'live_visitors': 5})()
		response = test_client.post(f'/api/analytics/custom-dashboard/{test_shop.id}', json={'selected_metrics': ['sales', 'orders']})
		assert response.status_code == 200
		data = response.get_json()['data']
		assert 'sales' in data and 'orders' in data

def test_alerts_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'sales': 1500, 'top_product': 'A'})()
		response = test_client.get(f'/api/analytics/alerts/{test_shop.id}?sales_goal=1000&inventory_threshold=10')
		assert response.status_code == 200
		alerts = response.get_json()['data']['alerts']
		assert any('Sales goal reached!' in a for a in alerts)

def test_mobile_dashboard_endpoint(test_client, test_shop):
	with patch('my_app.services.analytics_service.get_daily_analytics_for_shop_and_date') as mock_get:
		mock_get.return_value = type('Analytics', (), {'sales': 100, 'orders': 10, 'aov': 50, 'live_visitors': 5})()
		response = test_client.get(f'/api/analytics/mobile-dashboard/{test_shop.id}')
		assert response.status_code == 200
		data = response.get_json()['data']
		assert 'sales' in data and 'orders' in data and 'aov' in data and 'live_visitors' in data
