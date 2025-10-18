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

