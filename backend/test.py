from kyber import KyberWrapper
from security import encrypt_secret_key, decrypt_secret_key
import hashlib

dummyPassword = "dummy_password"
salt = b'\x00' * 16  # Dummy salt for testing
iv = b'\x00' * 16  # Dummy IV for testing

kyber = KyberWrapper()

# Step 1: Generate keys
pk_hex, sk_hex = kyber.generate_keypair()
print("Public Key:", pk_hex)
print("Secret Key:", sk_hex)
pk = bytes.fromhex(pk_hex)
sk = bytes.fromhex(sk_hex)

# Step 2: Encapsulate
ct, ss_enc = kyber.encapsulate(pk)

encrypted_sk = encrypt_secret_key(sk_hex, dummyPassword, salt, iv)
decrypt_sk = decrypt_secret_key(encrypted_sk.hex(), dummyPassword, salt.hex(), iv.hex())
print("Decrypted Secret Key:", decrypt_sk)



# Step 3: Decapsulate
ss_dec = kyber.decapsulate(ct, bytes.fromhex(decrypt_sk))

print(ss_enc.hex())
print(ss_dec.hex())
# Step 4: Compare
assert ss_enc == ss_dec, "❌ Shared secret mismatch!"
print("✅ Shared secret matches.")
