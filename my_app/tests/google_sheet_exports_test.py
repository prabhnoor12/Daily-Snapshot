import pytest
from unittest.mock import patch, MagicMock
from my_app.services.google_sheets_export_service import export_to_google_sheets

def test_export_to_google_sheets_success():
    # Mock the Google Sheets API client
    with patch('my_app.services.google_sheets_export_service.GoogleSheetsClient') as MockClient:
        mock_client = MockClient.return_value
        mock_client.export.return_value = True
        # Example data to export
        data = [
            {'date': '2025-12-01', 'sales': 100, 'orders': 10},
            {'date': '2025-12-02', 'sales': 150, 'orders': 15}
        ]
        sheet_id = 'test-sheet-id'
        result = export_to_google_sheets(sheet_id, data)
        assert result is True
        mock_client.export.assert_called_once_with(sheet_id, data)

def test_export_to_google_sheets_failure():
    with patch('my_app.services.google_sheets_export_service.GoogleSheetsClient') as MockClient:
        mock_client = MockClient.return_value
        mock_client.export.return_value = False
        data = []
        sheet_id = 'test-sheet-id'
        result = export_to_google_sheets(sheet_id, data)
        assert result is False
