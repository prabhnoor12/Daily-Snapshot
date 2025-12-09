
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def export_to_google_sheets(data):
    """
    Export analytics data to Google Sheets using gspread, with customizable columns and filters.
    Args:
        data (dict): {
            "sheet_name": str,
            "headers": list,
            "rows": list,
            "credentials_path": str,
            "user_email": str (optional),
            "columns": list (optional),
            "filters": dict (optional)
        }
    Returns:
        dict: Export result
    """
    try:
        sheet_name = data.get("sheet_name", "Analytics Export")
        headers = data.get("headers", [])
        rows = data.get("rows", [])
        credentials_path = data.get("credentials_path")
        user_email = data.get("user_email")
        columns = data.get("columns")  # List of columns to export
        filters = data.get("filters")   # Dict of filters to apply to rows
        if not credentials_path:
            return error_response("Google API credentials path required", status_code=400)
        # Apply column selection
        if columns:
            headers = [h for h in headers if h in columns]
            rows = [[row[headers.index(h)] for h in headers] for row in rows]
        # Apply filters
        if filters:
            def row_matches(row_dict):
                return all(row_dict.get(k) == v for k, v in filters.items())
            # Convert rows to dict for filtering
            filtered_rows = []
            for row in rows:
                row_dict = dict(zip(headers, row))
                if row_matches(row_dict):
                    filtered_rows.append(row)
            rows = filtered_rows
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
