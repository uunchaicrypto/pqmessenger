from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import base64
import json
import warnings
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv
from routes.auth import auth_bp
import redis

warnings.filterwarnings("ignore")
load_dotenv()


#redis setup
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True
)


# Firebase initialization
try:
    firebase_creds_base64 = os.getenv('FIREBASE_CREDENTIALS')
    if not firebase_creds_base64:
        raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

    # Padding fix
    padding = 4 - (len(firebase_creds_base64) % 4)
    if padding != 4:
        firebase_creds_base64 += '=' * padding

    firebase_creds_json = base64.b64decode(firebase_creds_base64).decode('utf-8')
    firebase_creds_dict = json.loads(firebase_creds_json)

    cred = credentials.Certificate(firebase_creds_dict)
    try:
        firebase_app = firebase_admin.get_app()
    except ValueError:
        firebase_app = initialize_app(cred)

    db = firestore.client(app=firebase_app)
    print("Firestore client initialized successfully")

except Exception as e:
    print(f"Firebase initialization error: {e}")
    exit(1)


try:
    redis_client.ping()
    print("Redis client initialized successfully")
except redis.exceptions.ConnectionError:
    print("Redis connection failed.")
    exit(1)


# App setup
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config["JWT_SECRET_KEY"] = os.getenv('FLASK_JWT_SECRET')
app.redis_client = redis_client

# Setup CORS for all API routes with credentials support
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# JWT Manager
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    print("Starting Flask app...")
    app.run(debug=True, host='0.0.0.0', port=5000)
