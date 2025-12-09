import io
from flask import Blueprint, request, send_file, jsonify
from ..services.benchmarking_service import get_benchmarking_data

benchmarking_bp = Blueprint('benchmarking', __name__)

@benchmarking_bp.route('/benchmarking/<int:shop_id>', methods=['GET'])
def api_benchmarking(shop_id):
    # Support date range, widgets, export format
    export_format = request.args.get('export')
    response = get_benchmarking_data(shop_id)
    # If export requested, return file
    if export_format in ['pdf', 'excel'] and response.get('success'):
        report_bytes = response['data']['export_report'](export_format)
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"benchmarking_report_{shop_id}.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(report_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(response)
