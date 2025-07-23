from ctypes import CDLL
try:
    lib = CDLL("./libkyber.dll")
    print("Kyber shared library loaded successfully")
except Exception as e:
    print("Error loading Kyber shared library:", e)
