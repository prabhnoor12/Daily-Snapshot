from flask import Blueprint, request, jsonify
from ..services.benchmarking_service import get_benchmarking_data

benchmarking_bp = Blueprint('benchmarking', __name__)

@benchmarking_bp.route('/benchmarking/<int:shop_id>', methods=['GET'])
def api_benchmarking(shop_id):
    return get_benchmarking_data(shop_id)
