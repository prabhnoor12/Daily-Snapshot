from flask import Blueprint, request, send_file, jsonify
from ..services.forecasting_service import (
    get_sales_forecast,
    get_orders_forecast
)
import io

forecasting_bp = Blueprint('forecasting', __name__)

@forecasting_bp.route('/forecasting/sales/<int:shop_id>', methods=['GET'])
def api_sales_forecast(shop_id):
    segment = request.args.get('segment')
    export_format = request.args.get('export')
    response = get_sales_forecast(shop_id, segment=segment)
    # If export requested, return file
    if export_format in ['pdf', 'excel'] and response.get('success') and response['data'].get('chart_data'):
        # Example: Export chart data as PDF/Excel (extend service for real export if needed)
        # Here, just return chart_data as a file for demonstration
        import json
        file_bytes = json.dumps(response['data']['chart_data']).encode('utf-8')
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"sales_forecast_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(response)

@forecasting_bp.route('/forecasting/orders/<int:shop_id>', methods=['GET'])
def api_orders_forecast(shop_id):
    segment = request.args.get('segment')
    export_format = request.args.get('export')
    response = get_orders_forecast(shop_id, segment=segment)
    if export_format in ['pdf', 'excel'] and response.get('success') and response['data'].get('chart_data'):
        import json
        file_bytes = json.dumps(response['data']['chart_data']).encode('utf-8')
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"orders_forecast_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(response)
