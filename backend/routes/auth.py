from flask import Blueprint, request, jsonify, current_app, g
import hashlib
import secrets
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding
import os
from datetime import datetime
import jwt
from models.user import User
from kyber import KyberWrapper
from security import (
    validate_username,
    validate_password,
    hash_password,
    check_password,
    encrypt_secret_key,
)
from firebase_admin import firestore

auth_bp = Blueprint("auth", __name__, url_prefix="/api")
kyber_wrapper = KyberWrapper()


# --- Registration ---
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        if not username or not password or not confirm_password:
            return jsonify({"error": "All fields are required"}), 400

        is_valid, msg = validate_username(username)
        if not is_valid:
            return jsonify({"error": msg}), 400

        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({"error": msg}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        db = firestore.client()
        if User.get_by_username(db, username):
            return jsonify({"error": "Username already exists"}), 409

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
            salt=salt.hex(),
        )

        user_id = new_user.save(db)
        token = jwt.encode(
            {"user_id": user_id},
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256",
        )

        return (
            jsonify(
                {
                    "message": "User registered successfully",
                    "user_id": user_id,
                    "username": new_user.username,
                    "token": token,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


# --- Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        db = firestore.client()
        user_doc = User.get_by_username(db, username)
        if not user_doc or not check_password(password, user_doc.password_hash):
            return jsonify({"error": "Invalid username or password"}), 401

        user_id = user_doc.id
        token = jwt.encode(
            {"user_id": user_id},
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({"message": "Login successful", "token": token}), 200

    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500


# --- Middleware ---
@auth_bp.before_request
def require_auth():
    public_routes = ["auth.register", "auth.login"]

    if request.method == "OPTIONS":
        return

    if request.endpoint in public_routes:
        return

    token = request.headers.get("Authorization", "")
    if not token:
        return jsonify({"error": "Token is missing"}), 401

    if token.startswith("Bearer "):
        token = token.split(" ")[1]
    else:
        return jsonify({"error": "Invalid token format"}), 401

    try:
        decoded_token = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
        g.user_id = decoded_token["user_id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": f"Token validation failed: {str(e)}"}), 500


# --- User Profile ---
@auth_bp.route("/user", methods=["GET"])
def profile():
    try:
        user_id = g.user_id
        db = firestore.client()
        user_doc = User.get_by_id(db, user_id)
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        return (
            jsonify(
                {
                    "user_id": user_doc.id,
                    "username": user_doc.username,
                    "created_at": user_doc.created_at.isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Profile retrieval failed: {str(e)}"}), 500


@auth_bp.route("/add_friend", methods=["POST"])
def add_friend():
    try:
        data = request.get_json()
        friend_username = data.get("user", "").strip()

        if not friend_username:
            return jsonify({"error": "Friend username is required"}), 400

        db = firestore.client()

        user_doc = User.get_by_id(db, g.user_id)
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        user_data = db.collection("users").document(g.user_id).get().to_dict()

        friend_doc = User.get_by_username(db, friend_username)
        if not friend_doc:
            return jsonify({"error": "Friend not found"}), 404

        if friend_doc.id == user_doc.id:
            return jsonify({"error": "You cannot add yourself as a friend"}), 400
        if friend_doc.id in user_data.get("friends", []):
            return jsonify({"error": "User is already your friend"}), 400

        friend_ref = db.collection("users").document(friend_doc.id)
        friend_data = friend_ref.get().to_dict()

        if not friend_data:
            return jsonify({"error": "Friend user data missing"}), 404

        pending = friend_data.get("pending_request_from", [])

        if g.user_id in pending:
            return jsonify({"error": "Friend request already sent"}), 400

        pending.append(g.user_id)

        friend_ref.update({"pending_request_from": pending})

        return jsonify({"message": "Friend request sent successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to add friend: {str(e)}"}), 500


@auth_bp.route("/get_requests", methods=["GET"])
def get_friend_requests():
    try:
        db = firestore.client()
        user_ref = db.collection("users").document(g.user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = user_doc.to_dict()
        pending_ids = data.get("pending_request_from", [])

        users = []
        for uid in pending_ids:
            u_doc = db.collection("users").document(uid).get()
            if u_doc.exists:
                u_data = u_doc.to_dict()
                users.append({"id": uid, "username": u_data.get("username", "Unknown")})

        return jsonify(users), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch requests: {str(e)}"}), 500


@auth_bp.route("/accept_request", methods=["POST"])
def accept_friend_request():
    try:
        data = request.get_json()
        from_user_id = data.get("from_user_id")

        if not from_user_id:
            return jsonify({"error": "Sender user ID is required"}), 400

        db = firestore.client()

        current_ref = db.collection("users").document(g.user_id)
        sender_ref = db.collection("users").document(from_user_id)

        current_doc = current_ref.get()
        sender_doc = sender_ref.get()

        if not current_doc.exists or not sender_doc.exists:
            return jsonify({"error": "User not found"}), 404

        current_data = current_doc.to_dict()
        sender_data = sender_doc.to_dict()

        pending = current_data.get("pending_request_from", [])
        if from_user_id in pending:
            pending.remove(from_user_id)

        current_friends = current_data.get("friends", [])
        sender_friends = sender_data.get("friends", [])

        if from_user_id not in current_friends:
            current_friends.append(from_user_id)
        if g.user_id not in sender_friends:
            sender_friends.append(g.user_id)

        # Update both user docs
        current_ref.update(
            {"pending_request_from": pending, "friends": current_friends}
        )
        sender_ref.update({"friends": sender_friends})

        # Send notification to sender
        sender_notifications = sender_data.get("notifications", [])
        sender_notifications.append(
            {
                "username": current_data.get("username", "Unknown"),
                "type": "accept",
                "time": datetime.utcnow().isoformat(),
            }
        )
        sender_ref.update({"notifications": sender_notifications})

        return jsonify({"message": "Friend request accepted"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to accept request: {str(e)}"}), 500


@auth_bp.route("/decline_request", methods=["POST"])
def decline_friend_request():
    try:
        data = request.get_json()
        from_user_id = data.get("from_user_id")

        if not from_user_id:
            return jsonify({"error": "Sender user ID is required"}), 400

        db = firestore.client()

        current_ref = db.collection("users").document(g.user_id)
        sender_ref = db.collection("users").document(from_user_id)

        current_doc = current_ref.get()
        sender_doc = sender_ref.get()

        if not current_doc.exists or not sender_doc.exists:
            return jsonify({"error": "User not found"}), 404

        current_data = current_doc.to_dict()
        sender_data = sender_doc.to_dict()

        pending = current_data.get("pending_request_from", [])
        if from_user_id in pending:
            pending.remove(from_user_id)

        current_ref.update({"pending_request_from": pending})

        # Send notification to sender
        sender_notifications = sender_data.get("notifications", [])
        sender_notifications.append(
            {
                "username": current_data.get("username", "Unknown"),
                "type": "decline",
                "time": datetime.utcnow().isoformat(),
            }
        )
        sender_ref.update({"notifications": sender_notifications})

        return jsonify({"message": "Friend request declined"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to decline request: {str(e)}"}), 500


@auth_bp.route("/get_friends", methods=["GET"])
def get_friends():
    try:
        db = firestore.client()
        user_ref = db.collection("users").document(g.user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = user_doc.to_dict()
        friend_ids = data.get("friends", [])

        friends = []
        for fid in friend_ids:
            friend_doc = db.collection("users").document(fid).get()
            if friend_doc.exists:
                f_data = friend_doc.to_dict()
                friends.append(
                    {
                        "id": fid,
                        "username": f_data.get("username", "Unknown"),
                        # You can add more fields if needed like profile pics etc.
                    }
                )

        return jsonify(friends), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch friends: {str(e)}"}), 500


@auth_bp.route("/get_friend_accept_notifications", methods=["GET"])
def get_friend_accept_notifications():
    try:
        db = firestore.client()
        current_user_ref = db.collection("users").document(g.user_id)
        current_user_doc = current_user_ref.get()

        if not current_user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = current_user_doc.to_dict()
        notifications = user_data.get("notifications", [])

        return jsonify(notifications), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch notifications: {str(e)}"}), 500


@auth_bp.route("/friend/<friend_id>", methods=["GET"])
def get_friend_by_id(friend_id):
    try:
        db = firestore.client()
        friend_doc = db.collection("users").document(friend_id).get()

        if not friend_doc.exists:
            return jsonify({"error": "Friend not found"}), 404

        friend_data = friend_doc.to_dict()

        # Return only relevant fields, exclude sensitive info
        result = {
            "id": friend_id,
            "username": friend_data.get("username", "Unknown"),
            "profilePic": friend_data.get("profilePic", None),  # if stored
            "joinedDate": friend_data.get("created_at", None),
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch friend info: {str(e)}"}), 500
@auth_bp.route("/friend/<friend_id>/<message>", methods=["POST"])
def chat_message(friend_id, message):
    try:
        db = firestore.client()
        friend_doc = db.collection("users").document(friend_id).get()
        if not friend_doc.exists:
            return jsonify({"error": "Friend not found"}), 404

        friend_data = friend_doc.to_dict()
        public_key = bytes.fromhex(friend_data.get("public_key"))

        if not public_key:
            return jsonify({"error": "Friend's public key not found"}), 404

        # Step 1: Encapsulate using Kyber
        kyber = KyberWrapper()
        ciphertext, shared_secret = kyber.encapsulate(public_key)

        # Step 2: Derive symmetric key from shared_secret
        key = hashlib.sha256(shared_secret).digest()  # 32 bytes AES key

        iv = secrets.token_bytes(16)

        cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
        encryptor = cipher.encryptor()
        padder = sym_padding.PKCS7(128).padder()

        padded_message = padder.update(message.encode()) + padder.finalize()
        encrypted_message = encryptor.update(padded_message) + encryptor.finalize()

        db.collection("messages").add(
            {
                "from": g.user_id,
                "to": friend_id,
                "ciphertext": ciphertext.hex(),
                "iv": iv.hex(),
                "message": encrypted_message.hex(),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        return jsonify({"message": "Message sent securely"}), 200

    except Exception as e:
        return jsonify({"error": f"Message sending failed: {str(e)}"}), 500


@auth_bp.route("/get_messages/<friend_id>", methods=["GET"])
def get_messages(friend_id):
    try:
        db = firestore.client()

        current_user_id = g.user_id

        messages_ref = db.collection("messages")
        sent_query = messages_ref.where("from", "==", current_user_id).where(
            "to", "==", friend_id
        )
        recv_query = messages_ref.where("from", "==", friend_id).where(
            "to", "==", current_user_id
        )

        sent_msgs = sent_query.stream()
        recv_msgs = recv_query.stream()

        all_msgs = []

        for msg in sent_msgs:
            data = msg.to_dict()
            all_msgs.append(
                {
                    "from": data["from"],
                    "to": data["to"],
                    "ciphertext": data["ciphertext"],
                    "iv": data["iv"],
                    "message": data["message"],
                    "timestamp": data["timestamp"],
                }
            )

        for msg in recv_msgs:
            data = msg.to_dict()
            all_msgs.append(
                {
                    "from": data["from"],
                    "to": data["to"],
                    "ciphertext": data["ciphertext"],
                    "iv": data["iv"],
                    "message": data["message"],
                    "timestamp": data["timestamp"],
                }
            )

        # Sort messages by timestamp
        all_msgs.sort(key=lambda m: m["timestamp"])

        return jsonify(all_msgs), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch messages: {str(e)}"}), 500