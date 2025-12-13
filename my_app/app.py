
from flask import Flask, jsonify
from my_app.config.cors import configure_cors

# Blueprints
from my_app.api.analyticsApi import analytics_bp
from my_app.api.authApi import auth_bp
from my_app.api.settingApi import setting_bp
from my_app.api.shopifywebhookApi import shopify_webhook_bp
from my_app.api.subscriptionApi import subscription_bp
from my_app.api.userApi import user_bp

# Middleware and error handling
from my_app.middleware.logger import log_request, log_response, log_error
from my_app.utils.error_handling import register_error_handlers


app = Flask(__name__)
configure_cors(app)

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

application = app
