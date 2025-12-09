
import pytest
from unittest.mock import patch, MagicMock
from my_app.services import forecasting_service
from my_app.models.analytics_model import DailyAnalytics
from flask import Flask

# Helper to create DailyAnalytics objects
def make_analytics(date, sales, orders):
	return MagicMock(date=date, sales=sales, orders=orders)

@pytest.mark.usefixtures('setup_database')
class TestForecastingService:
	@pytest.fixture(autouse=True)
	def setup(self, test_client, db_session, test_shop):
		self.client = test_client
		self.db = db_session
		self.shop = test_shop

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_sales_forecast_enough_data(self, mock_get):
		# 30 days of sales data
		analytics = [make_analytics(date=f'2025-11-{i+1:02d}', sales=100+i, orders=10+i) for i in range(30)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_sales_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert 'next_week_sales_forecast' in data
		assert len(data['exp_smoothing_forecast']) == 7
		assert len(data['arima_forecast']) == 7
		assert isinstance(data['chart_data'], list)
		assert not data['warnings']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_sales_forecast_not_enough_data(self, mock_get):
		# Only 3 days of sales data
		analytics = [make_analytics(date=f'2025-12-0{i+1}', sales=100, orders=10) for i in range(3)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_sales_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert 'warnings' in data and data['warnings']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_sales_forecast_no_data(self, mock_get):
		mock_get.return_value = []
		resp = forecasting_service.get_sales_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 400
		assert not resp.get_json()['success']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_sales_forecast_with_segment(self, mock_get):
		analytics = [make_analytics(date=f'2025-12-0{i+1}', sales=100+i, orders=10+i) for i in range(10)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_sales_forecast(shop_id=self.shop.shop_id, segment='region')
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert data['segment'] == 'region'

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_orders_forecast_enough_data(self, mock_get):
		analytics = [make_analytics(date=f'2025-11-{i+1:02d}', sales=100+i, orders=10+i) for i in range(30)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_orders_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert 'next_week_orders_forecast' in data
		assert len(data['exp_smoothing_forecast']) == 7
		assert len(data['arima_forecast']) == 7
		assert isinstance(data['chart_data'], list)
		assert not data['warnings']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_orders_forecast_not_enough_data(self, mock_get):
		analytics = [make_analytics(date=f'2025-12-0{i+1}', sales=100, orders=10) for i in range(3)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_orders_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert 'warnings' in data and data['warnings']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_orders_forecast_no_data(self, mock_get):
		mock_get.return_value = []
		resp = forecasting_service.get_orders_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 400
		assert not resp.get_json()['success']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_orders_forecast_with_segment(self, mock_get):
		analytics = [make_analytics(date=f'2025-12-0{i+1}', sales=100+i, orders=10+i) for i in range(10)]
		mock_get.return_value = analytics
		resp = forecasting_service.get_orders_forecast(shop_id=self.shop.shop_id, segment='device')
		assert resp.status_code == 200
		data = resp.get_json()['data']
		assert data['segment'] == 'device'

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_sales_forecast_exception(self, mock_get):
		mock_get.side_effect = Exception('DB error')
		resp = forecasting_service.get_sales_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 400 or resp.status_code == 500
		assert not resp.get_json()['success']

	@patch('my_app.services.forecasting_service.get_daily_analytics_for_shop')
	def test_orders_forecast_exception(self, mock_get):
		mock_get.side_effect = Exception('DB error')
		resp = forecasting_service.get_orders_forecast(shop_id=self.shop.shop_id)
		assert resp.status_code == 400 or resp.status_code == 500
		assert not resp.get_json()['success']
