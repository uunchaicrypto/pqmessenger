#ifndef KYBER_EXPORTS_H
#define KYBER_EXPORTS_H

#include <stdint.h>

#define EXPORT __declspec(dllexport)

EXPORT int my_crypto_kem_keypair(uint8_t *pk, uint8_t *sk);
EXPORT int my_crypto_kem_enc(uint8_t *ct, uint8_t *ss, const uint8_t *pk);
EXPORT int my_crypto_kem_dec(uint8_t *ss, const uint8_t *ct, const uint8_t *sk);

#endif

