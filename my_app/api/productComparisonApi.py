from flask import Blueprint, request, send_file, jsonify
from ..services.product_comparison_service import compare_products, compare_categories
import io

product_comparison_bp = Blueprint('product_comparison', __name__)

@product_comparison_bp.route('/compare/products', methods=['POST'])
def api_compare_products():
    data = request.get_json() or {}
    response = compare_products(data)
    # If export requested, return file
    export_format = data.get('export')
    if export_format in ['pdf', 'excel'] and response.get('success') and response['data'].get('export'):
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"product_comparison_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(response['data']['export']),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(response)

@product_comparison_bp.route('/compare/categories', methods=['POST'])
def api_compare_categories():
    data = request.get_json() or {}
    response = compare_categories(data)
    export_format = data.get('export')
    if export_format in ['pdf', 'excel'] and response.get('success') and response['data'].get('export'):
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"category_comparison_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(response['data']['export']),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(response)
