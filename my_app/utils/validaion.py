import re
from typing import Any

def is_email(email: str) -> bool:
    """
    Validate if the input string is a valid email address.
    Args:
        email (str): Email address to validate.
    Returns:
        bool: True if valid, False otherwise.
    """
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None

def is_phone_number(phone: str) -> bool:
    """
    Validate if the input string is a valid phone number (simple international format).
    Args:
        phone (str): Phone number to validate.
    Returns:
        bool: True if valid, False otherwise.
    """
    pattern = r"^\+?\d{10,15}$"
    return re.match(pattern, phone) is not None

def is_non_empty_string(value: Any) -> bool:
    """
    Check if the value is a non-empty string.
    Args:
        value (Any): Value to check.
    Returns:
        bool: True if non-empty string, False otherwise.
    """
    return isinstance(value, str) and bool(value.strip())

def is_positive_integer(value: Any) -> bool:
    """
    Check if the value is a positive integer.
    Args:
        value (Any): Value to check.
    Returns:
        bool: True if positive integer, False otherwise.
    """
    return isinstance(value, int) and value > 0

def is_valid_password(password: str, min_length: int = 8) -> bool:
    """
    Validate password strength (min length, contains letters and numbers).
    Args:
        password (str): Password to validate.
        min_length (int): Minimum length required.
    Returns:
        bool: True if valid, False otherwise.
    """
    if len(password) < min_length:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True
