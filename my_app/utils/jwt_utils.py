
import datetime
from typing import Any, Dict, Optional
# Uses PyJWT: https://pyjwt.readthedocs.io/en/stable/
import jwt  # PyJWT must be installed: pip install PyJWT

SECRET_KEY = "your-secret-key"  # Replace with your actual secret key
ALGORITHM = "HS256"

def encode_jwt(payload: Dict[str, Any], expires_in: int = 3600) -> str:
    """
    Encode a payload into a JWT token with expiration.
    Args:
        payload (Dict[str, Any]): The data to encode in the token.
        expires_in (int): Expiration time in seconds.
    Returns:
        str: Encoded JWT token.
    """
    payload = payload.copy()
    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token and return the payload if valid, else None.
    Args:
        token (str): JWT token to decode.
    Returns:
        Optional[Dict[str, Any]]: Decoded payload or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid (bad signature, malformed, etc.)
        return None

def verify_jwt(token: str) -> bool:
    """
    Verify if a JWT token is valid and not expired.
    Args:
        token (str): JWT token to verify.
    Returns:
        bool: True if valid, False otherwise.
    """
    return decode_jwt(token) is not None

def refresh_jwt_token(token: str, expires_in: int = 3600) -> Optional[str]:
    """
    Refresh a JWT token by creating a new token with the same payload but a new expiration.
    Args:
        token (str): The old JWT token to refresh.
        expires_in (int): Expiration time in seconds for the new token.
    Returns:
        Optional[str]: New JWT token if the old one is valid, else None.
    """
    payload = decode_jwt(token)
    if payload is None:
        return None
    payload.pop("exp", None)  # Remove old expiration
    return encode_jwt(payload, expires_in)
