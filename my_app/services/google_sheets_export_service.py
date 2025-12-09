
class GoogleSheetsClient:
    def export(self, sheet_id, data):
        # Stub: Simulate export logic
        return bool(data)

def export_to_google_sheets(sheet_id, data):
    client = GoogleSheetsClient()
    return client.export(sheet_id, data)

