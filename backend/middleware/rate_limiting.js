
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';

// Custom key generator: use shop domain if available, else use ipKeyGenerator for IPv6 compatibility
function shopOrIpKey(req) {
    return req.shop?.shop || ipKeyGenerator(req);
}

// Default limiter: 1000 requests per 15 minutes per shop/IP
export const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: shopOrIpKey,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.setHeader('Retry-After', Math.ceil(15 * 60));
        res.status(429).json({
            success: false,
            statusCode: 429,
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later.',
            requestId: req.id,
        });
    },
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyGenerator: shopOrIpKey,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.setHeader('Retry-After', Math.ceil(15 * 60));
        res.status(429).json({
            success: false,
            statusCode: 429,
            code: 'RATE_LIMITED',
            message: 'Too many login attempts, please try again later.',
            requestId: req.id,
        });
    },
});

// Factory for custom limiters
export function createRateLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: shopOrIpKey,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
            res.status(429).json({
                success: false,
                statusCode: 429,
                code: 'RATE_LIMITED',
                message: message || 'Too many requests, please try again later.',
                requestId: req.id,
            });
        },
    });
}
