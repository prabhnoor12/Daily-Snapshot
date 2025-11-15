import os
import redis
import threading
import time
from typing import Optional

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REFRESH_INTERVAL = int(os.getenv("REDIS_REFRESH_INTERVAL", 10800))  # Default: 3 hours
LATENCY_THRESHOLD = float(os.getenv("REDIS_LATENCY_THRESHOLD", 0.5))  # seconds

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
    """
    Get the current Redis client instance, creating it if necessary.
    Returns:
        redis.Redis: Redis client instance.
    """
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            socket_timeout=5
        )
    return _redis_client


def refresh_redis_connection():
    """
    Refresh the Redis connection if latency exceeds the threshold.
    """
    global _redis_client
    try:
        start = time.time()
        client = get_redis_client()
        client.ping()
        latency = time.time() - start
        if latency > LATENCY_THRESHOLD:
            _redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                password=REDIS_PASSWORD,
                socket_timeout=5
            )
            print(f"Redis connection refreshed due to high latency: {latency:.2f}s")
    except Exception as e:
        print(f"Error refreshing Redis connection: {e}")
        _redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            password=REDIS_PASSWORD,
            socket_timeout=5
        )


def start_redis_refresh_thread():
    """
    Start a background thread to refresh Redis connection every REFRESH_INTERVAL seconds.
    """
    def refresh_loop():
        while True:
            refresh_redis_connection()
            time.sleep(REFRESH_INTERVAL)
    thread = threading.Thread(target=refresh_loop, daemon=True)
    thread.start()

# Start the refresh thread when this module is imported
start_redis_refresh_thread()
