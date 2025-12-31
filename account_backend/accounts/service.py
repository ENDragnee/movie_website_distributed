import hashlib
import hmac

def verify_better_auth_password(plain_password, stored_password):
    try:
        # Split the salt and the hash
        salt_hex, hash_hex = stored_password.split(':')
        
        # Convert hex strings back to bytes
        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(hash_hex)

        # Better Auth / Scrypt default parameters:
        # N (Cost): 16384, r (Block size): 8, p (Parallelization): 1
        # Key length is 64 bytes (which results in 128 hex characters)
        derived_hash = hashlib.scrypt(
            plain_password.encode('utf-8'),
            salt=salt,
            n=16384,
            r=16,
            p=1,
            dklen=64
        )

        # Use hmac.compare_digest for security against timing attacks
        return hmac.compare_digest(derived_hash, stored_hash)
    except (ValueError, AttributeError):
        return False