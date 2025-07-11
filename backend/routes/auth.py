from flask import Blueprint, request, jsonify, current_app, g
import os
import jwt
from models.user import User
from kyber import KyberWrapper
from security import (
    validate_username,
    validate_password,
    hash_password,
    check_password,
    encrypt_secret_key
)
from firebase_admin import firestore

auth_bp = Blueprint('auth', __name__, url_prefix='/api')
kyber_wrapper = KyberWrapper()

# --- Registration ---
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')

        if not username or not password or not confirm_password:
            return jsonify({'error': 'All fields are required'}), 400

        is_valid, msg = validate_username(username)
        if not is_valid:
            return jsonify({'error': msg}), 400

        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': msg}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        db = firestore.client()
        if User.get_by_username(db, username):
            return jsonify({'error': 'Username already exists'}), 409

        public_key, secret_key = kyber_wrapper.generate_keypair()
        salt = os.urandom(16)
        iv = os.urandom(16)
        encrypted_sk = encrypt_secret_key(secret_key, password, salt, iv)
        password_hash = hash_password(password)

        new_user = User(
            username=username,
            password_hash=password_hash,
            public_key=public_key,
            encrypted_secret_key=encrypted_sk.hex(),
            iv=iv.hex(),
            salt=salt.hex()
        )

        user_id = new_user.save(db)
        token = jwt.encode({'user_id': user_id}, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': new_user.username,
            'token': token,
        }), 201

    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

# --- Login ---
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        print("Incoming login data:", data)
        print("Extracted username:", username)
        print("Extracted password:", password)
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        db = firestore.client()
        user_doc = User.get_by_username(db, username)
        if not user_doc or not check_password(password, user_doc.password_hash):
            return jsonify({'error': 'Invalid username or password'}), 401

        user_id = user_doc.id
        token = jwt.encode({'user_id': user_id}, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({'message': 'Login successful', 'token': token}), 200

    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

# --- Middleware ---
@auth_bp.before_request
def require_auth():
    public_routes = ['auth.register', 'auth.login']
    
    if request.method == 'OPTIONS':
        return  # Let CORS handle preflight requests

    if request.endpoint in public_routes:
        return

    token = request.headers.get('Authorization', '')
    if not token:
        return jsonify({'error': 'Token is missing'}), 401

    if token.startswith("Bearer "):
        token = token.split(" ")[1]
    else:
        return jsonify({'error': 'Invalid token format'}), 401

    try:
        decoded_token = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        g.user_id = decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': f'Token validation failed: {str(e)}'}), 500

# --- User Profile ---
@auth_bp.route('/user', methods=['GET'])
def profile():
    try:
        user_id = g.user_id
        db = firestore.client()
        user_doc = User.get_by_id(db, user_id)
        if not user_doc:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user_id': user_doc.id,
            'username': user_doc.username,
            'created_at': user_doc.created_at.isoformat(),
        }), 200

    except Exception as e:
        return jsonify({'error': f'Profile retrieval failed: {str(e)}'}), 500
