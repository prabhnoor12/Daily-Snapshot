import io
from flask import Blueprint, request, send_file, jsonify
from my_app.middleware.shopify_session import verify_shopify_session_token
from ..services.benchmarking_service import get_benchmarking_data

benchmarking_bp = Blueprint('benchmarking', __name__)

# Helper to get benchmarking data
def _get_data(shop_id):
    return get_benchmarking_data(shop_id)

# Individual endpoints for each feature
@benchmarking_bp.route('/benchmarking/<int:shop_id>/metrics', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_metrics(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['metrics'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/trends', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_trends(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['chart_data'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/correlation', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_correlation(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['correlation'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/segmentation', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_segmentation(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['segmented_benchmarking'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/warnings', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_warnings(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['warnings'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/milestones', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_milestones(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['milestones'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/recommendations', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_recommendations(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['recommendations'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/dashboard', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_dashboard(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['dashboard'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/summary', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_summary(shop_id):
    data = _get_data(shop_id)
    return jsonify(data['data']['summary'])

@benchmarking_bp.route('/benchmarking/<int:shop_id>/export', methods=['GET'])
@verify_shopify_session_token
def api_benchmarking_export(shop_id):
    export_format = request.args.get('format', 'pdf')
    data = _get_data(shop_id)
    if export_format in ['pdf', 'excel'] and data.get('success'):
        report_bytes = data['data']['export_report'](export_format)
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"benchmarking_report_{shop_id}.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(report_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(data)
