import os
import re
import bcrypt
import base64

from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from dotenv import load_dotenv
load_dotenv()

PBKDF2_ITERATIONS = int(os.getenv("PBKDF2_ITERATIONS", 100000))
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", 12))

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

def validate_username(username):
    if len(username) < 3 or len(username) > 20:
        return False, "Username must be between 3 and 20 characters"
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, "Username is valid"

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(BCRYPT_ROUNDS)).decode()

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())

def encrypt_secret_key(secret_key_hex, password, salt, iv):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=PBKDF2_ITERATIONS
    )
    encryption_key = kdf.derive(password.encode())

    cipher = Cipher(algorithms.AES(encryption_key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(128).padder()

    secret_key_bytes = bytes.fromhex(secret_key_hex)
    padded_sk = padder.update(secret_key_bytes) + padder.finalize()

    encrypted_sk = encryptor.update(padded_sk) + encryptor.finalize()
    return encrypted_sk
def decrypt_secret_key(encrypted_sk_hex, password, salt_hex, iv_hex):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=bytes.fromhex(salt_hex),
        iterations=PBKDF2_ITERATIONS
    )
    decryption_key = kdf.derive(password.encode())

    cipher = Cipher(algorithms.AES(decryption_key), modes.CBC(bytes.fromhex(iv_hex)))
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(bytes.fromhex(encrypted_sk_hex)) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    return unpadder.update(decrypted_padded) + unpadder.finalize()

