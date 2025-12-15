from flask import Blueprint, request, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services.google_sheets_export_service import export_to_google_sheets

google_sheets_export_bp = Blueprint('google_sheets_export', __name__)

@google_sheets_export_bp.route('/export/google-sheets', methods=['POST'])
@verify_shopify_session_token
def api_export_google_sheets():
    data = request.get_json() or {}
    return export_to_google_sheets(data)
