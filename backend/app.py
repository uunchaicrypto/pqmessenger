from flask import Flask
from flask_cors import CORS
import os
import re
import base64
import bcrypt
from routes.auth import auth_bp
import firebase_admin
from firebase_admin import credentials, auth, firestore

cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# importing models (will need to be updated for Firestore)
from models import User, Friend, Message
# from models.user import User
# from models.friend import Friend
# from models.message import Message
from kyber import KyberWrapper
from dotenv import load_dotenv
# from flask_sqlalchemy import SQLAlchemy
load_dotenv()

app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')  # pulls from .env
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# db.init_app(app)

CORS(app)

from security import (
    validate_password,
    validate_username,
    hash_password,
    check_password,
    encrypt_secret_key
)

app.register_blueprint(auth_bp)

kyber_wrapper = KyberWrapper()

if __name__ == '__main__':
    print("Starting Flask app...")
    print("Running server...")
    app.run(debug=True, host='0.0.0.0', port=5000)