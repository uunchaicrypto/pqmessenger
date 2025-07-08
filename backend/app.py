from flask import Flask
from flask_cors import CORS
import os
import re
import base64
import bcrypt

#importing db
from models import db
from models.user import User
from models.friend import Friend
from models.message import Message
from kyber import KyberWrapper
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

db.init_app(app)
CORS(app)

from security import (
    validate_password,
    validate_username,
    hash_password,
    check_password,
    encrypt_secret_key
)

kyber_wrapper = KyberWrapper()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)