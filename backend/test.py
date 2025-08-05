from kyber import KyberWrapper
from security import encrypt_secret_key, decrypt_secret_key
import secrets
import hashlib
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

dummyPassword = "dummy_password"
salt = secrets.token_bytes(16)  # Dummy salt for testing
iv = secrets.token_bytes(16)  # Dummy IV for testing

kyber = KyberWrapper()

dummyMessage = "Hello Fucking WOrld"


# Step 1: Generate keys
pk_hex, sk_hex = kyber.generate_keypair()

# print("Public Key:", pk_hex)
# print("Secret Key:", sk_hex)
pk = bytes.fromhex(pk_hex)
sk = bytes.fromhex(sk_hex)

#aes key
aes_key = secrets.token_bytes(32)  # Dummy AES key for testing
print("AES Key:", aes_key.hex())
iv_message = secrets.token_bytes(16)  # Dummy IV for testing

#encrypt the message
cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv_message))
encryptor = cipher.encryptor()
padder = padding.PKCS7(128).padder()

padded_msg = padder.update(dummyMessage.encode()) + padder.finalize()
encrypted_message = encryptor.update(padded_msg) + encryptor.finalize()

# Step 2: Encapsulate
ct, ss_enc = kyber.encapsulate(pk)

encrypted_sk = encrypt_secret_key(sk_hex, dummyPassword, salt, iv)
decrypt_sk = decrypt_secret_key(encrypted_sk.hex(), dummyPassword, salt.hex(), iv.hex())
print("Decrypted Secret Key:", decrypt_sk)

key = hashlib.sha256(ss_enc).digest()
iv_key = secrets.token_bytes(16)  # Dummy IV for AES key decryption


#cipher aes key
cipher_for_aes_key = Cipher(algorithms.AES(key), modes.CBC(iv_key))
encryptor_for_aes_key = cipher_for_aes_key.encryptor()
padder_for_aes_key = padding.PKCS7(128).padder()
padded_aes_key = padder_for_aes_key.update(aes_key) + padder_for_aes_key.finalize()
encrypted_aes_key = encryptor_for_aes_key.update(padded_aes_key) + encryptor_for_aes_key.finalize()

ss_dec = kyber.decapsulate(ct, bytes.fromhex(decrypt_sk))

key_aes_key = hashlib.sha256(ss_dec).digest()
cipher_for_aes_key = Cipher(algorithms.AES(key_aes_key), modes.CBC(iv_key))
decryptor_for_aes_key = cipher_for_aes_key.decryptor()
decrypted_padded_aes_key = decryptor_for_aes_key.update(encrypted_aes_key) + decryptor_for_aes_key.finalize()
unpadder_for_aes_key = padding.PKCS7(128).unpadder()
decrypted_aes_key = unpadder_for_aes_key.update(decrypted_padded_aes_key) + unpadder_for_aes_key.finalize()

print("Decrypted AES Key:", decrypted_aes_key.hex())

# Step 3: Decrypt the message
cipher = Cipher(algorithms.AES(decrypted_aes_key), modes.CBC(iv_message))
decryptor = cipher.decryptor()
decrypted_padded_msg = decryptor.update(encrypted_message) + decryptor.finalize()
unpadder = padding.PKCS7(128).unpadder()
decrypted_msg = unpadder.update(decrypted_padded_msg) + unpadder.finalize()
print("Decrypted Message:", decrypted_msg.decode())

# Step 4: Compare
assert ss_enc == ss_dec, "❌ Shared secret mismatch!"
print("✅ Shared secret matches.")
