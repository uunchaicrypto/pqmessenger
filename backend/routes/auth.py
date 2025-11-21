from flask import Blueprint, request, jsonify, current_app, g
import hashlib
import secrets
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding
import os
from datetime import datetime, timezone
import jwt
from models.user import User
from kyber import KyberWrapper
from security import (
    validate_username,
    validate_password,
    hash_password,
    check_password,
    encrypt_secret_key,
    decrypt_secret_key,
    decrypt_message,
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

        public_key, private_key = kyber_wrapper.generate_keypair()

        salt = os.urandom(16)
        iv = os.urandom(16)
        encrypted_sk = encrypt_secret_key(private_key, password, salt, iv)
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

        # Session ID
        session_id = secrets.token_hex(16)
        redis_client = current_app.redis_client

        # Store session in Redis (manually, with string values)
        redis_client.hset(f"session:{session_id}", "user_id", str(user_id))
        redis_client.hset(f"session:{session_id}", "username", username)
        redis_client.hset(f"session:{session_id}", "private_key", private_key)
        redis_client.hset(f"session:{session_id}", "created_at", datetime.now(timezone.utc).isoformat())
        redis_client.expire(f"session:{session_id}", 3600)

        token = jwt.encode(
            {"user_id": user_id, "session_id": session_id},
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "username": new_user.username,
            "token": token,
        }), 201

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

        user_data = user_doc.to_dict()
        sender_pk = bytes.fromhex(user_data.get("public_key", ""))
        if not user_data:
            return jsonify({"error": "User data not found"}), 404

        user_private_key = user_data.get("encrypted_secret_key", "")
        if not user_private_key:
            return jsonify({"error": "User private key not found"}), 404

        user_salt_hex = user_data.get("salt", "")
        user_iv_hex = user_data.get("iv", "")
        decrypted_private_key = decrypt_secret_key(
            user_private_key, password, user_salt_hex, user_iv_hex
        )
        if not decrypted_private_key:
            return jsonify({"error": "Decryption failed"}), 500
        
        #create a aes key for the session
        aes_key = secrets.token_bytes(32) # 256-bit aes key
        
        #wrap the AES key for sender 
        kyber = KyberWrapper()
        ct_sender, ss_sender = kyber.encapsulate(sender_pk)
        key_sender = hashlib.sha256(ss_sender).digest()
        iv_sender = secrets.token_bytes(16)

        cipher_sender = Cipher(algorithms.AES(key_sender), modes.CBC(iv_sender))
        encryptor_sender = cipher_sender.encryptor()
        padder_sender = sym_padding.PKCS7(128).padder()
        padded_aes_key_s = padder_sender.update(aes_key) + padder_sender.finalize()
        encrypted_aes_key_sender = encryptor_sender.update(padded_aes_key_s) + encryptor_sender.finalize()

        # Store session in Redis
        session_id = secrets.token_hex(16)
        redis_client = current_app.redis_client


        redis_client.hset(f"session:{session_id}", "private_key", decrypted_private_key)  # No .hex()
        redis_client.hset(f"session:{session_id}", "aes_key", aes_key.hex())
        redis_client.hset(f"session:{session_id}", "ct_sender", ct_sender.hex())
        redis_client.hset(f"session:{session_id}", "encrypted_aes_key", encrypted_aes_key_sender.hex())
        redis_client.hset(f"session:{session_id}", "iv_sender", iv_sender.hex())

        redis_client.expire(f"session:{session_id}", 3600)

        token = jwt.encode(
            {"user_id": user_doc.id, "session_id": session_id},
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

        # Set user and session info in g
        g.user_id = decoded_token["user_id"]
        g.session_id = decoded_token["session_id"]
        
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
        kyber = KyberWrapper()
        redis_client = current_app.redis_client
        session = g.session_id
        # Get both of'em's data
        user_doc = db.collection("users").document(g.user_id).get()
        friend_doc = db.collection("users").document(friend_id).get()

        # print("data gotten")

        if not user_doc.exists or not friend_doc.exists:
            return jsonify({"error": "User or friend not found"}), 404
        # get actual public keys
        receiver_pk = bytes.fromhex(friend_doc.to_dict().get("public_key"))

        # print("public keys gotten")

        # Retrieve session aes key from redis server
        aes_key = bytes.fromhex(redis_client.hget(f"session:{session}", "aes_key"))
        iv_message = secrets.token_bytes(16)
        # print("aes key and iv generated")

        # Encrypt the message
        cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv_message))
        encryptor = cipher.encryptor()
        padder = sym_padding.PKCS7(128).padder()
        # print("cipher created")

        padded_msg = padder.update(message.encode()) + padder.finalize()
        encrypted_message = encryptor.update(padded_msg) + encryptor.finalize()
        # print("message encrypted")

        # print("receiver pk type:", type(receiver_pk))
        # Retrieve the wrapped aes key for receiver if exists
        encrypted_aes_key_receiver = redis_client.hget(f"session:{friend_id}", "encrypted_aes_key")
        if encrypted_aes_key_receiver: 
            encrypted_aes_key_receiver = bytes.fromhex(encrypted_aes_key_receiver)
            iv_receiver = bytes.fromhex(redis_client.hget(f"session:{friend_id}", "iv_receiver"))
            ct_receiver = bytes.fromhex(redis_client.hget(f"session:{friend_id}", "ct_receiver"))
            # print("found existing wrapped key for receiver in redis")
        else:
            #  Wrap the AES key for receiver
            ct_receiver, ss_receiver = kyber.encapsulate(receiver_pk)
            key_receiver = hashlib.sha256(ss_receiver).digest()
            iv_receiver = secrets.token_bytes(16)
            # print("receiver's kyber encapsulated")

            cipher_receiver = Cipher(algorithms.AES(key_receiver), modes.CBC(iv_receiver))
            encryptor_receiver = cipher_receiver.encryptor()
            padder_receiver = sym_padding.PKCS7(128).padder()
            padded_aes_key_r = padder_receiver.update(aes_key) + padder_receiver.finalize()
            encrypted_aes_key_receiver = encryptor_receiver.update(padded_aes_key_r) + encryptor_receiver.finalize()
            # Store wrapped key in redis for future use
            redis_client.hset(f"session:{friend_id}", "encrypted_aes_key", encrypted_aes_key_receiver.hex())
            redis_client.hset(f"session:{friend_id}", "iv_receiver", iv_receiver.hex())
            redis_client.hset(f"session:{friend_id}", "ct_receiver", ct_receiver.hex())
            # print("receiver's aes key encrypted")

        # Retrieve the wrapped aes key for sender
        
        encrypted_aes_key_sender = bytes.fromhex(redis_client.hget(f"session:{session}", "encrypted_aes_key"))
        iv_sender = bytes.fromhex(redis_client.hget(f"session:{session}", "iv_sender"))
        ct_sender = bytes.fromhex(redis_client.hget(f"session:{session}", "ct_sender"))
        # print("sender's aes key encrypted")
        #  Store in database
        # print('aes key:', aes_key)
        # print("Encrypting for receiver:")
        # print("Receiver public key:", receiver_pk.hex())
        # print("Receiver ct:", ct_receiver.hex())
        # print("Receiver ss:", ss_receiver.hex())
        # print("Receiver IV:", iv_receiver.hex())
        # print("Encrypting for sender:")
        # print("Sender public key:", sender_pk.hex()) 
        # print("Sender ct:", ct_sender.hex())
        # print("Sender ss:", ss_sender.hex())
        # print("Sender IV:", iv_sender.hex())

        db.collection("messages").add({
            "from": g.user_id,
            "to": friend_id,
            "message": encrypted_message.hex(),
            "iv_message": iv_message.hex(),

            "receiver_ciphertext": ct_receiver.hex(),
            "receiver_encrypted_key": encrypted_aes_key_receiver.hex(),
            "receiver_iv": iv_receiver.hex(),

            "sender_ciphertext": ct_sender.hex(),
            "sender_encrypted_key": encrypted_aes_key_sender.hex(),
            "sender_iv": iv_sender.hex(),

            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        redis_client.expire(f"session:{session}", 3600)


        return jsonify({"message": "Secure message sent!"}), 200

    except Exception as e:
        return jsonify({"error": f"Message send failed: {str(e)}"}), 500




@auth_bp.route("/get_messages/<friend_id>", methods=["GET"])
def get_messages(friend_id):
    try:
        db = firestore.client()
        current_user_id = g.user_id
        # print("got user id:", current_user_id)

        # Get both of'em's data
        user_doc = db.collection("users").document(current_user_id).get()
        friend_doc = db.collection("users").document(friend_id).get()
        # print("both user docs gotten    ")

        if not user_doc.exists or not friend_doc.exists:
            return jsonify({"error": "User or friend not found"}), 404 

        # get user's private key 
        redis_client = current_app.redis_client
        session_id = g.session_id
        private_key_hex = redis_client.hget(f"session:{session_id}", "private_key")
        if not private_key_hex: 
            return jsonify({"error": "Session not found"}), 404
        # print("user private key gotten  ")
        # print(private_key_hex)

        private_key = bytes.fromhex(private_key_hex)
        # print("user private key converted from hex to bytes")

        messages_ref = db.collection("messages")
        sent_query = messages_ref.where("from", "==", current_user_id).where(
            "to", "==", friend_id
        )
        recv_query = messages_ref.where("from", "==", friend_id).where(
            "to", "==", current_user_id
        )
        # print("queries created")

        sent_msgs = sent_query.stream()
        recv_msgs = recv_query.stream()
        # print("messages fetched")
        all_msgs = []

        for msg in sent_msgs:
            data = msg.to_dict()
            all_msgs.append(
            {
                "from": data["from"],
                "to": data["to"],
                "message": data["message"],
                "iv_message": data["iv_message"],
                "sender_ciphertext": data["sender_ciphertext"],
                "sender_encrypted_key": data["sender_encrypted_key"],
                "sender_iv": data["sender_iv"],
                "receiver_ciphertext": data["receiver_ciphertext"],
                "receiver_encrypted_key": data["receiver_encrypted_key"],
                "receiver_iv": data["receiver_iv"],
                "timestamp": data["timestamp"],
            }
            )
            # print("sent messages processed")

        for msg in recv_msgs:
            data = msg.to_dict()
            all_msgs.append(
            {
                "from": data["from"],
                "to": data["to"],
                "message": data["message"],
                "iv_message": data["iv_message"],
                "sender_ciphertext": data["sender_ciphertext"],
                "sender_encrypted_key": data["sender_encrypted_key"],
                "sender_iv": data["sender_iv"],
                "receiver_ciphertext": data["receiver_ciphertext"],
                "receiver_encrypted_key": data["receiver_encrypted_key"],
                "receiver_iv": data["receiver_iv"],
                "timestamp": data["timestamp"],
            }
            )
            # print("received messages processed")

        # Sort messages by timestamp
        all_msgs.sort(key=lambda m: m["timestamp"])

        # print("messages sorted by timestamp")

        for eachmsg in all_msgs:
            decrypted_message = decrypt_message(eachmsg, current_user_id, private_key)
            eachmsg["message"] = decrypted_message

        # print("messages decrypted")

        return jsonify(all_msgs), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch messages: {str(e)}"}), 500