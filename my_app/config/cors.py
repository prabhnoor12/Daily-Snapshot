# Add Flask-CORS to allow frontend on render.com
from flask_cors import CORS

def configure_cors(app):
    # Allow deployed frontend and localhost for development
    CORS(
        app,
        origins=[
            "https://daily-snapshot.onrender.com",
            "https://daily-snapshot-1.onrender.com",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ],
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-Shopify-Access-Token"
        ],
        expose_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-Shopify-Access-Token"
        ]
    )
