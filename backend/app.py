from flask import Flask
from flask_cors import CORS
import os
import re
import base64
import bcrypt
import warnings
from routes.auth import auth_bp
import firebase_admin
from firebase_admin import credentials, auth, firestore, initialize_app
import json
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

load_dotenv()

try:
    firebase_creds_base64 = os.getenv('FIREBASE_CREDENTIALS')
    if not firebase_creds_base64:
        raise ValueError("environment variable is not set")

    try:
        # Add padding if needed
        padding = 4 - (len(firebase_creds_base64) % 4)
        if padding != 4:
            firebase_creds_base64 += '=' * padding
        
        firebase_creds_json = base64.b64decode(firebase_creds_base64).decode('utf-8')
        firebase_creds_dict = json.loads(firebase_creds_json)
    except Exception as decode_error:
        print(f"Error decoding Firebase credentials: {decode_error}")
        raise

    cred = credentials.Certificate(firebase_creds_dict)
    
    try:
        firebase_app = firebase_admin.get_app()
    except ValueError:
        firebase_app = initialize_app(cred)

    db = firestore.client(app=firebase_app)
    print("Firestore client initialized successfully")
    
except Exception as e:
    print(f"Firebase initialization error: {e}")

from models import User, Friend, Message
from kyber import KyberWrapper
from security import (
    validate_password,
    validate_username,
    hash_password,
    check_password,
    encrypt_secret_key
)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
CORS(app)

app.register_blueprint(auth_bp)

kyber_wrapper = KyberWrapper()

if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(debug=True, host='0.0.0.0', port=5000)