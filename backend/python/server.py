from flask import Flask
from flask_cors import CORS
import os

# Import the blueprint from our routes file with its new name
from services.ExtractPdf import extract_pdf_bp

# --- App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for the frontend

# --- App Configuration ---
# Create an 'uploads' directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# --- API Routes ---
# Register the blueprint, all routes in it will be prefixed with /api
app.register_blueprint(extract_pdf_bp, url_prefix='/api')

@app.route('/')
def index():
    return "Python extraction backend is running..."

# --- Main Execution ---
if __name__ == '__main__':
    # Using port 5001 to avoid conflict with the Node.js server (port 5000)
    app.run(debug=True, port=5001)