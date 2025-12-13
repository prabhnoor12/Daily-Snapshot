from flask import Blueprint, request, send_file, jsonify
from ..services.forecasting_service import get_sales_forecast, get_orders_forecast
import io, json

forecasting_bp = Blueprint('forecasting', __name__)

# Helper to get sales forecast data
def _get_sales(shop_id):
    segment = request.args.get('segment')
    return get_sales_forecast(shop_id, segment=segment)

# Helper to get orders forecast data
def _get_orders(shop_id):
    segment = request.args.get('segment')
    return get_orders_forecast(shop_id, segment=segment)

# Individual endpoints for sales forecast features
@forecasting_bp.route('/forecasting/sales/<int:shop_id>/forecast', methods=['GET'])
def api_sales_forecast(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['next_week_sales_forecast'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/exp_smoothing', methods=['GET'])
def api_sales_exp_smoothing(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['exp_smoothing_forecast'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/arima', methods=['GET'])
def api_sales_arima(shop_id):
    data = _get_sales(shop_id)
    return jsonify({
        'forecast': data['data']['arima_forecast'],
        'confidence_intervals': data['data']['arima_confidence_intervals']
    })

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/trend', methods=['GET'])
def api_sales_trend(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['trend'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/chart', methods=['GET'])
def api_sales_chart(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['chart_data'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/warnings', methods=['GET'])
def api_sales_warnings(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['warnings'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/summary', methods=['GET'])
def api_sales_summary(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['summary'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/recommendation', methods=['GET'])
def api_sales_recommendation(shop_id):
    data = _get_sales(shop_id)
    return jsonify(data['data']['recommendation'])

@forecasting_bp.route('/forecasting/sales/<int:shop_id>/export', methods=['GET'])
def api_sales_export(shop_id):
    export_format = request.args.get('format', 'pdf')
    data = _get_sales(shop_id)
    if export_format in ['pdf', 'excel'] and data.get('success'):
        file_bytes = json.dumps(data['data']['chart_data']).encode('utf-8')
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"sales_forecast_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(data)

# Individual endpoints for orders forecast features
@forecasting_bp.route('/forecasting/orders/<int:shop_id>/forecast', methods=['GET'])
def api_orders_forecast(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['next_week_orders_forecast'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/exp_smoothing', methods=['GET'])
def api_orders_exp_smoothing(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['exp_smoothing_forecast'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/arima', methods=['GET'])
def api_orders_arima(shop_id):
    data = _get_orders(shop_id)
    return jsonify({
        'forecast': data['data']['arima_forecast'],
        'confidence_intervals': data['data']['arima_confidence_intervals']
    })

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/trend', methods=['GET'])
def api_orders_trend(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['trend'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/chart', methods=['GET'])
def api_orders_chart(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['chart_data'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/warnings', methods=['GET'])
def api_orders_warnings(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['warnings'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/summary', methods=['GET'])
def api_orders_summary(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['summary'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/recommendation', methods=['GET'])
def api_orders_recommendation(shop_id):
    data = _get_orders(shop_id)
    return jsonify(data['data']['recommendation'])

@forecasting_bp.route('/forecasting/orders/<int:shop_id>/export', methods=['GET'])
def api_orders_export(shop_id):
    export_format = request.args.get('format', 'pdf')
    data = _get_orders(shop_id)
    if export_format in ['pdf', 'excel'] and data.get('success'):
        file_bytes = json.dumps(data['data']['chart_data']).encode('utf-8')
        mimetype = 'application/pdf' if export_format == 'pdf' else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f"orders_forecast_report.{export_format if export_format == 'pdf' else 'xlsx'}"
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    return jsonify(data)
