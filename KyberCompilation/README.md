# 🧩 Building a Kyber DLL from the Official pq-crystals Repository

This guide explains how to convert the official [pq-crystals/kyber](https://github.com/pq-crystals/kyber) post-quantum key encapsulation library into a **Windows DLL** for use in other programming environments (e.g., Python, C#, etc.).

---

## 📦 Overview

The original Kyber repository is designed for **Linux-like environments**, producing **`.so` (shared object)** files.
To integrate it with Windows applications, we create a **DLL (Dynamic Link Library)** by wrapping its internal C functions into a simplified, exportable interface.

Your working directory should already include:

```
├── kyber_wrapper.c
├── kyber_exports.h
├── (cloned Kyber source files)
```

---

## 🔗 1. Clone the Official Kyber Repository

Download the uncompiled Kyber source code:

```bash
git clone https://github.com/pq-crystals/kyber.git
cd kyber/crypto_kem/kyber768/ref
```

This directory contains all required source files:

```
api.h
cbd.c
indcpa.c
kem.c
ntt.c
poly.c
polyvec.c
randombytes.c
reduce.c
symmetric-shake.c
verify.c
```

---

## 🧱 2. Add the Wrapper and Export Files

In the same directory, add the following two files (you already have them):

### 🔹 `kyber_exports.h`

```c
#ifndef KYBER_EXPORTS_H
#define KYBER_EXPORTS_H

#include <stdint.h>

#define EXPORT __declspec(dllexport)

EXPORT int my_crypto_kem_keypair(uint8_t *pk, uint8_t *sk);
EXPORT int my_crypto_kem_enc(uint8_t *ct, uint8_t *ss, const uint8_t *pk);
EXPORT int my_crypto_kem_dec(uint8_t *ss, const uint8_t *ct, const uint8_t *sk);

#endif
```

### 🔹 `kyber_wrapper.c`

```c
#include "api.h"

int my_crypto_kem_keypair(unsigned char *pk, unsigned char *sk) {
    return pqcrystals_kyber768_ref_keypair(pk, sk);
}

int my_crypto_kem_enc(unsigned char *ct, unsigned char *ss, const unsigned char *pk) {
    return pqcrystals_kyber768_ref_enc(ct, ss, pk);
}

int my_crypto_kem_dec(unsigned char *ss, const unsigned char *ct, const unsigned char *sk) {
    return pqcrystals_kyber768_ref_dec(ss, ct, sk);
}
```

🧠 **Explanation:**
These “wrapper” functions call the original internal Kyber implementations and expose them through a clean, minimal API that can be exported into the DLL.

---

## ⚙️ 3. Compile the DLL (Windows)

### ✅ Prerequisites

* **GCC for Windows (MinGW or MSYS2)** installed and added to PATH
  Check by running:

  ```bash
  gcc --version
  ```

### 🔧 Compile Command

Run this command inside the `ref` directory:

```bash
gcc -shared -o kyber.dll kyber_wrapper.c cbd.c indcpa.c kem.c ntt.c poly.c polyvec.c randombytes.c reduce.c symmetric-shake.c verify.c -I. -DKYBER_EXPORTS
```

---

## 🧹 4. Output

After compilation, you should have:

```
kyber.dll
```

✅ **This DLL** contains all necessary Kyber functions wrapped via `kyber_wrapper.c`, and can be imported from other languages (e.g., using Python’s `ctypes` or .NET P/Invoke).

---

## 🧠 5. Quick Test (Optional)

Example in **Python** using `ctypes`:

```python
from ctypes import CDLL, c_ubyte, POINTER

kyber = CDLL("./kyber.dll")

pk = (c_ubyte * 1184)()
sk = (c_ubyte * 2400)()
ct = (c_ubyte * 1088)()
ss = (c_ubyte * 32)()

kyber.my_crypto_kem_keypair(pk, sk)
kyber.my_crypto_kem_enc(ct, ss, pk)
```

---

## 🧾 Summary

| Step | Description                                                           |
| ---- | --------------------------------------------------------------------- |
| 1️⃣  | Clone the official Kyber repo                                         |
| 2️⃣  | Add wrapper (`kyber_wrapper.c`) and export header (`kyber_exports.h`) |
| 3️⃣  | Compile into DLL using GCC                                            |
| 4️⃣  | Use DLL in your target language/application                           |

---

## 📚 Reference

* 🔗 Official Kyber repository: [https://github.com/pq-crystals/kyber](https://github.com/pq-crystals/kyber)
* 📘 Kyber documentation: [NIST PQC Project](https://pq-crystals.org/kyber/)
* ⚙️ MinGW for Windows: [https://www.mingw-w64.org/](https://www.mingw-w64.org/)

---

🧠 *Now you have a Windows-compatible DLL version of the Kyber post-quantum KEM — ready to be used securely in your cryptographic applications!*
