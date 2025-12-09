from flask import Blueprint, request, jsonify
from ..services.google_sheets_export_service import export_to_google_sheets

google_sheets_export_bp = Blueprint('google_sheets_export', __name__)

@google_sheets_export_bp.route('/export/google-sheets', methods=['POST'])
def api_export_google_sheets():
    data = request.get_json() or {}
    return export_to_google_sheets(data)
