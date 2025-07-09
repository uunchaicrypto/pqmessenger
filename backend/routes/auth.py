from flask import Blueprint, request, jsonify, current_app
from models.user import User
# from models import db
from kyber import KyberWrapper
from security import (
    validate_username,
    validate_password,
    hash_password,
    encrypt_secret_key
)
import os
import binascii
from firebase_admin import firestore

auth_bp = Blueprint('auth', __name__)
kyber_wrapper = KyberWrapper()

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')

        if not username or not password or not confirm_password:
            return jsonify({'error': 'All fields are required'}), 400

        is_valid, message = validate_username(username)
        if not is_valid:
            return jsonify({'error': message}), 400

        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        try:
            from firebase_admin import firestore
            db = firestore.client()
        except Exception as e:
            print(f"Firebase not available: {e}")
            return jsonify({'error': 'Database not available'}), 503
        
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

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': new_user.username
        }), 201

    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500