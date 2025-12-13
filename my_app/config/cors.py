# Add Flask-CORS to allow frontend on render.com
from flask_cors import CORS

def configure_cors(app):
    # Allow only the deployed frontend
    CORS(app, origins=["https://daily-snapshot.onrender.com"], supports_credentials=True)
