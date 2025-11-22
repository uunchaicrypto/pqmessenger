# ---- This is the file for the SECURITY LAYER ----

import os
import re
import bcrypt
import base64
import secrets
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import padding 
from kyber import KyberWrapper
import hashlib

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from dotenv import load_dotenv
load_dotenv()

PBKDF2_ITERATIONS = int(os.getenv("PBKDF2_ITERATIONS", 100000))
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", 12))

def generate_key_pair():
    kyber = KyberWrapper()
    public_key, private_key = kyber.generate_keypair()
    return public_key, private_key



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

#encrypt aes key, given the user's private key and the aes key to be encrypted
def encrypt_aes_key(private_key, aes_key):
    kyber = KyberWrapper()
    ciphertext, shared_secret = kyber.encapsulate(private_key)
    key_user = hashlib.sha256(shared_secret).digest()
    iv_user = secrets.token_bytes(16)

    cipher = Cipher(algorithms.AES(key_user), modes.CBC(iv_user))
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(128).padder()

    padded_aes_key = padder.update(aes_key) + padder.finalize()
    encrypted_aes_key = encryptor.update(padded_aes_key) + encryptor.finalize()

    return ciphertext, encrypted_aes_key, iv_user

#encrypt message using aes key and iv
def encrypt_message(aes_key,message,iv_message):
    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv_message))
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(128).padder()
    # print("cipher created")

    padded_msg = padder.update(message.encode()) + padder.finalize()
    encrypted_message = encryptor.update(padded_msg) + encryptor.finalize()
        # print("message encrypted")
    return encrypted_message


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
    return (unpadder.update(decrypted_padded) + unpadder.finalize()).hex()


def decrypt_message(message_doc: dict, current_user_id, private_key):
    kyber = KyberWrapper()
    if current_user_id == message_doc.get("to"):
        # Receiver
        ciphertext = bytes.fromhex(message_doc.get("receiver_ciphertext"))
        encrypted_aes_key = bytes.fromhex(message_doc.get("receiver_encrypted_key"))
        iv_aes = bytes.fromhex(message_doc.get("receiver_iv"))
    else:
        # Sender
        ciphertext = bytes.fromhex(message_doc.get("sender_ciphertext"))
        encrypted_aes_key = bytes.fromhex(message_doc.get("sender_encrypted_key"))
        iv_aes = bytes.fromhex(message_doc.get("sender_iv"))

    # print("Decapsulating with private key")
    # print("Ciphertext:", ciphertext.hex())

    # Derive shared secret using Kyber decapsulation
    shared_secret = kyber.decapsulate(ciphertext, private_key)
    key_aes_key = hashlib.sha256(shared_secret).digest()
    # print("Shared Secret:", shared_secret.hex())
    # print("Derived Key:", key_aes_key.hex())

    # Decrypt AES key using AES
    cipher_for_aes_key = Cipher(algorithms.AES(key_aes_key), modes.CBC(iv_aes))
    decryptor = cipher_for_aes_key.decryptor()
    padded_aes_key = decryptor.update(encrypted_aes_key) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    aes_key = unpadder.update(padded_aes_key) + unpadder.finalize()

    # Decrypt the actual message
    iv_message = bytes.fromhex(message_doc.get("iv_message"))
    encrypted_message = bytes.fromhex(message_doc.get("message"))

    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv_message))
    decryptor = cipher.decryptor()
    padded_plaintext = decryptor.update(encrypted_message) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

    return plaintext.decode()
