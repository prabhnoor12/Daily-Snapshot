// Redis connection with auto-reconnect and latency refresh
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const LATENCY_THRESHOLD_MS = 200; // Customize as needed
let redis = createRedisClient();

function createRedisClient() {
    const client = new Redis(REDIS_URL, {
        reconnectOnError: (err) => {
            // Always reconnect on error
            return true;
        },
        retryStrategy: (times) => {
            // Exponential backoff
            return Math.min(times * 50, 2000);
        }
    });
    client.on('error', (err) => {
        console.error('Redis error:', err);
    });
    client.on('connect', () => {
        console.log('Connected to Redis');
    });
    return client;
}

export async function checkAndRefreshRedisConnection() {
    if (!redis) redis = createRedisClient();
    const start = Date.now();
    try {
        await redis.ping();
        const latency = Date.now() - start;
        if (latency > LATENCY_THRESHOLD_MS) {
            console.warn(`Redis latency ${latency}ms exceeds threshold, refreshing connection.`);
            redis.disconnect();
            redis = createRedisClient();
        }
    } catch (err) {
        console.error('Redis ping failed, reconnecting...', err);
        redis.disconnect();
        redis = createRedisClient();
    }
}

export { redis };
