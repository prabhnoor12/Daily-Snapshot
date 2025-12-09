
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def export_to_google_sheets(data):
    """
    Export analytics data to Google Sheets using gspread.
    Args:
        data (dict): {"sheet_name": str, "headers": list, "rows": list, "credentials_path": str}
    Returns:
        dict: Export result
    """
    try:
        sheet_name = data.get("sheet_name", "Analytics Export")
        headers = data.get("headers", [])
        rows = data.get("rows", [])
        credentials_path = data.get("credentials_path")
        if not credentials_path:
            return error_response("Google API credentials path required", status_code=400)
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)
        client = gspread.authorize(creds)
        # Create new sheet
        sheet = client.create(sheet_name)
        worksheet = sheet.get_worksheet(0)
        # Share with user's email if provided
        user_email = data.get("user_email")
        if user_email:
            sheet.share(user_email, perm_type='user', role='writer')
        # Write headers and rows
        if headers:
            worksheet.insert_row(headers, 1)
        for idx, row in enumerate(rows, start=2):
            worksheet.insert_row(row, idx)
        return success_response({"sheet_url": sheet.url}, message="Exported to Google Sheets")
    except Exception as e:
        logger.error(f"Google Sheets export error: {e}")
        return error_response("Export to Google Sheets failed")
