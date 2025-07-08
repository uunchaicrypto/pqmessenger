from flask import Flask
from flask_cors import CORS
import os
import re
import base64
import bcrypt
from routes.auth import auth_bp
import firebase_admin
from firebase_admin import credentials, auth, firestore
import json
from dotenv import load_dotenv

load_dotenv()

firebase_creds_base64 = os.getenv('FIREBASE_CREDENTIALS')
firebase_creds_json = base64.b64decode(firebase_creds_base64).decode('utf-8')
firebase_creds_dict = json.loads(firebase_creds_json)

cred = credentials.Certificate(firebase_creds_dict)
firebase_admin.initialize_app(cred)

db = firestore.client()

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