import os
from ctypes import CDLL, c_ubyte, POINTER, c_int
from dotenv import load_dotenv

load_dotenv()

class KyberWrapper:
    def __init__(self, lib_path=None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        default_path = os.path.join(base_dir, 'libkyber.so')
        self.lib_path = lib_path or os.getenv('KYBER_LIB_PATH', default_path)

        try:
            self.kyber = CDLL(self.lib_path)
            self.kyber.my_crypto_kem_keypair.argtypes = [POINTER(c_ubyte), POINTER(c_ubyte)]
            self.kyber.my_crypto_kem_keypair.restype = c_int
        except Exception as e:
            print(f"Warning: Could not load Kyber library from {self.lib_path}: {e}")
            self.kyber = None

    def generate_keypair(self):
        if not self.kyber:
            pk = os.urandom(1184)
            sk = os.urandom(2400)
            return pk.hex(), sk.hex()
        
        pk = (c_ubyte * 1184)()
        sk = (c_ubyte * 2400)()
        
        if self.kyber.my_crypto_kem_keypair(pk, sk) != 0:
            raise Exception("Kyber keypair generation failed")
        
        return bytes(pk).hex(), bytes(sk).hex()