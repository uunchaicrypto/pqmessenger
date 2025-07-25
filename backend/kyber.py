import os
import platform
from ctypes import CDLL, c_ubyte, POINTER, c_int
from dotenv import load_dotenv

load_dotenv()


class KyberWrapper:
    def __init__(self, lib_path=None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        ext = {
            "Windows": "dll",
            "Linux": "so",
        }.get(
            platform.system(), "so"
        )  # Default to 'so' if unknown

        default_path = os.path.join(base_dir, f"libkyber.{ext}")
        self.lib_path = lib_path or os.getenv("KYBER_LIB_PATH", default_path)

        try:
            self.kyber = CDLL(self.lib_path)

            # Define argument and return types for keypair
            self.kyber.my_crypto_kem_keypair.argtypes = [
                POINTER(c_ubyte),
                POINTER(c_ubyte),
            ]
            self.kyber.my_crypto_kem_keypair.restype = c_int

            # Define argument and return types for encapsulation
            self.kyber.my_crypto_kem_enc.argtypes = [
                POINTER(c_ubyte),
                POINTER(c_ubyte),
                POINTER(c_ubyte),
            ]
            self.kyber.my_crypto_kem_enc.restype = c_int
            self.kyber.my_crypto_kem_dec.argtypes = [POINTER(c_ubyte), POINTER(c_ubyte), POINTER(c_ubyte)]
            self.kyber.my_crypto_kem_dec.restype = c_int

        except Exception as e:
            print(f"⚠️ Warning: Could not load Kyber library from {self.lib_path}: {e}")
            self.kyber = None

    def generate_keypair(self):
        """Generate Kyber public/private keypair."""
        if not self.kyber:
            # Fallback mock (testing only)
            pk = os.urandom(1184)
            sk = os.urandom(2400)
            return pk.hex(), sk.hex()

        pk = (c_ubyte * 1184)()
        sk = (c_ubyte * 2400)()

        if self.kyber.my_crypto_kem_keypair(pk, sk) != 0:
            raise Exception("Kyber keypair generation failed")

        return bytes(pk).hex(), bytes(sk).hex()

    def encapsulate(self, pk_bytes):
        """Run Kyber encapsulation on given public key bytes."""
        if not self.kyber:
            # Fallback mock (testing only)
            shared_secret = os.urandom(32)
            ciphertext = os.urandom(1088)
            return ciphertext, shared_secret

        pk = (c_ubyte * 1184).from_buffer_copy(pk_bytes)
        ct = (c_ubyte * 1088)()
        ss = (c_ubyte * 32)()

        if self.kyber.my_crypto_kem_enc(ct, ss, pk) != 0:
            raise Exception("Kyber encapsulation failed")

        return bytes(ct), bytes(ss)
    def decapsulate(self, ct_bytes, sk_bytes):
        if not self.kyber:
        # fallback for testing
            return os.urandom(32)

        ct = (c_ubyte * 1088).from_buffer_copy(ct_bytes)
        sk = (c_ubyte * 2400).from_buffer_copy(sk_bytes)
        ss = (c_ubyte * 32)()

        if self.kyber.my_crypto_kem_dec(ss, ct, sk) != 0:
            raise Exception("Kyber decapsulation failed")

        return bytes(ss)