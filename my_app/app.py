from flask import Flask, jsonify

# Blueprints
from api.analyticsApi import analytics_bp
from api.authApi import auth_bp
from api.settingApi import setting_bp
from api.shopifywebhookApi import shopify_webhook_bp
from api.subscriptionApi import subscription_bp
from api.userApi import user_bp

# Middleware and error handling
from middleware.logger import log_request, log_response, log_error
from utils.error_handling import register_error_handlers

app = Flask(__name__)

# Register blueprints
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(setting_bp, url_prefix='/api')
app.register_blueprint(shopify_webhook_bp, url_prefix='/api')
app.register_blueprint(subscription_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')

# Integrate logging middleware
app.before_request(log_request)
app.after_request(log_response)

# Register error handlers
register_error_handlers(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=3000)
