import jwt
import requests
from flask import request, g, jsonify
from functools import wraps
from my_app.config.shopify import SHOPIFY_API_KEY
import time


SHOPIFY_JWKS_URL = "https://shopify.dev/jwks.json"

_jwks_cache = None
_jwks_cache_time = 0
_JWKS_CACHE_TTL = 60 * 60  # 1 hour

def get_shopify_public_keys():
    """
    Fetch and cache Shopify's public keys (JWKS).
    Refreshes cache every _JWKS_CACHE_TTL seconds.
    """
    global _jwks_cache, _jwks_cache_time
    now = time.time()
    if _jwks_cache is not None and (now - _jwks_cache_time) < _JWKS_CACHE_TTL:
        return _jwks_cache
    try:
        resp = requests.get(SHOPIFY_JWKS_URL, timeout=5)
        resp.raise_for_status()
        keys = resp.json().get("keys")
        if not keys:
            raise ValueError("No keys found in JWKS response")
        _jwks_cache = keys
        _jwks_cache_time = now
        return _jwks_cache
    except Exception as e:
        # If cache exists, use it as fallback
        if _jwks_cache is not None:
            return _jwks_cache
        raise RuntimeError(f"Failed to fetch Shopify public keys: {e}")

def verify_shopify_session_token(f):
    """
    Flask decorator to verify Shopify session token from Authorization header.
    Attaches shop info to Flask global context (g).
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            keys = get_shopify_public_keys()
            payload = None
            last_exception = None
            for key in keys:
                try:
                    rsa_algorithm = getattr(jwt, 'algorithms', None)
                    if rsa_algorithm is None or not hasattr(rsa_algorithm, 'RSAAlgorithm'):
                        raise RuntimeError("PyJWT RSAAlgorithm not available. Please ensure you have PyJWT >=2.0 installed.")
                    payload = jwt.decode(
                        token,
                        key=rsa_algorithm.RSAAlgorithm.from_jwk(key),
                        algorithms=["RS256"],
                        audience=SHOPIFY_API_KEY,
                        options={"require": ["dest", "sub", "exp", "aud"]}
                    )
                    break
                except jwt.InvalidTokenError as e:
                    last_exception = e
                    continue
            if payload is None:
                raise jwt.InvalidTokenError(f"No valid key found: {last_exception}")
        except Exception as e:
            return jsonify({"error": f"Invalid session token: {str(e)}"}), 401

        # Validate required claims
        if not isinstance(payload, dict) or "dest" not in payload or "sub" not in payload:
            return jsonify({"error": "Session token missing required claims"}), 401

        g.shop = payload.get("dest")
        g.shopify_user = payload.get("sub")
        g.session_token_payload = payload
        return f(*args, **kwargs)
    return decorated_function
