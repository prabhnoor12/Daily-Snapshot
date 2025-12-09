import pytest
from unittest.mock import patch, MagicMock
from my_app.services import benchmarking_service
from flask import Flask
from datetime import datetime, timedelta

# Helper to create DailyAnalytics-like objects
class FakeAnalytics:
    def __init__(self, date, sales=None, orders=None, aov=None, live_visitors=None, top_product=None):
        self.date = date
        self.sales = sales
        self.orders = orders
        self.aov = aov
        self.live_visitors = live_visitors
        self.top_product = top_product

@pytest.fixture(scope='module')
def test_client():
    from my_app.app import app as flask_app
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

@pytest.fixture(scope='function')
def mock_db():
    return MagicMock()

class TestBenchmarkingService:
    @pytest.fixture(autouse=True)
    def setup(self, test_client, mock_db):
        self.client = test_client
        self.db = mock_db
        self.shop_id = 'test_shop_id'

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_default_last_30_days(self, mock_session, mock_get):
        base_date = datetime(2025, 11, 1)
        analytics = [
            FakeAnalytics(date=base_date + timedelta(days=i), sales=100+i, orders=10+i, aov=50+i, live_visitors=20+i, top_product=None)
            for i in range(30)
        ]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        assert 'metrics' in data
        assert 'summary' in data
        assert 'correlation' in data
        assert 'segmented_benchmarking' in data
        assert 'warnings' in data
        assert 'recommendations' in data
        assert 'dashboard' in data
        assert 'chart_data' in data

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_date_range(self, mock_session, mock_get):
        base_date = datetime(2025, 10, 1)
        analytics = [FakeAnalytics(date=base_date + timedelta(days=i), sales=100, orders=10, aov=50, live_visitors=20, top_product=None) for i in range(60)]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context('/?start_date=2025-10-10&end_date=2025-10-20'):
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        assert len(data['summary']['date_range']) == 11

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_invalid_date(self, mock_session, mock_get):
        mock_get.return_value = []
        mock_session.return_value = self.db
        with self.client.application.test_request_context('/?start_date=bad-date&end_date=2025-10-20'):
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 400
        assert 'Invalid date format' in resp.get_json()['message']

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_no_data(self, mock_session, mock_get):
        mock_get.return_value = []
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 404
        assert 'No analytics data found' in resp.get_json()['message']

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_missing_zero_outlier(self, mock_session, mock_get):
        base_date = datetime(2025, 11, 1)
        analytics = [
            FakeAnalytics(date=base_date + timedelta(days=i), sales=None if i==0 else (0 if i==1 else (1000 if i==2 else 100)), orders=10, aov=50, live_visitors=20, top_product=None)
            for i in range(10)
        ]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        warnings = data['warnings']
        assert any('missing' in w for w in warnings)
        assert any('zero' in w for w in warnings)
        assert any('outlier' in w for w in warnings)

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_segmentation(self, mock_session, mock_get):
        base_date = datetime(2025, 11, 1)
        analytics = [FakeAnalytics(date=base_date + timedelta(days=i), sales=100, orders=10, aov=50, live_visitors=20, top_product='A' if i%2==0 else 'B') for i in range(10)]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        seg = data['segmented_benchmarking']
        assert 'A' in seg and 'B' in seg
        assert seg['A']['count'] > 0 and seg['B']['count'] > 0

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_dashboard_widgets(self, mock_session, mock_get):
        base_date = datetime(2025, 11, 1)
        analytics = [FakeAnalytics(date=base_date + timedelta(days=i), sales=100+i, orders=10+i, aov=50+i, live_visitors=20+i, top_product=None) for i in range(10)]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context('/?widgets=sales,orders'):
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 200
        data = resp.get_json()['data']
        dashboard = data['dashboard']
        assert 'sales' in dashboard and 'orders' in dashboard
        assert len(dashboard) == 2

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_export_report(self, mock_session, mock_get):
        base_date = datetime(2025, 11, 1)
        analytics = [FakeAnalytics(date=base_date + timedelta(days=i), sales=100+i, orders=10+i, aov=50+i, live_visitors=20+i, top_product=None) for i in range(10)]
        mock_get.return_value = analytics
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            benchmarking_service.get_benchmarking_data(self.shop_id)
            export_func = benchmarking_service.get_benchmarking_data.export_report
            assert callable(export_func)
            pdf_bytes = export_func('pdf')
            assert isinstance(pdf_bytes, (bytes, bytearray))
            excel_bytes = export_func('excel')
            assert isinstance(excel_bytes, (bytes, bytearray))
            unknown = export_func('unknown')
            assert b'Unknown format' in unknown

    @patch('my_app.services.benchmarking_service.get_daily_analytics_for_shop')
    @patch('my_app.database.SessionLocal')
    def test_benchmarking_exception(self, mock_session, mock_get):
        mock_get.side_effect = Exception('DB error')
        mock_session.return_value = self.db
        with self.client.application.test_request_context():
            resp = benchmarking_service.get_benchmarking_data(self.shop_id)
        assert resp.status_code == 400
        assert 'Benchmarking failed' in resp.get_json()['message']
