from flask import Blueprint, request, jsonify
from ..services.product_comparison_service import compare_products, compare_categories

product_comparison_bp = Blueprint('product_comparison', __name__)

@product_comparison_bp.route('/compare/products', methods=['POST'])
def api_compare_products():
    data = request.get_json() or {}
    return compare_products(data)

@product_comparison_bp.route('/compare/categories', methods=['POST'])
def api_compare_categories():
    data = request.get_json() or {}
    return compare_categories(data)
