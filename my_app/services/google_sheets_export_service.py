

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger

def export_to_google_sheets(sheet_id, data, credentials_path, headers=None):
    """
    Export data to a Google Sheet using gspread and OAuth2 credentials.
    Args:
        sheet_id (str): The ID of the Google Sheet to export to.
        data (list of dict): List of row dicts to write.
        credentials_path (str): Path to Google API credentials JSON file.
        headers (list, optional): List of column headers. If None, uses keys from first row.
    Returns:
        dict: Success or error response.
    """
    try:
        if not credentials_path:
            return error_response("Google API credentials path required", status_code=400)
        if not data:
            return error_response("No data to export", status_code=400)
        # Use headers from first row if not provided
        if headers is None:
            headers = list(data[0].keys())
        rows = [[row.get(h, '') for h in headers] for row in data]
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_key(sheet_id)
        worksheet = sheet.get_worksheet(0)
        worksheet.clear()
        worksheet.insert_row(headers, 1)
        for idx, row in enumerate(rows, start=2):
            worksheet.insert_row(row, idx)
        return success_response({"sheet_url": sheet.url}, message="Exported to Google Sheets")
    except Exception as e:
        logger.error(f"Google Sheets export error: {e}")
        return error_response("Export to Google Sheets failed")

