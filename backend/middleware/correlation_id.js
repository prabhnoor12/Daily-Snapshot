
import { v4 as uuidv4 } from 'uuid';

export function correlationId(req, res, next) {
    // Normalize header access (case-insensitive)
    const headerId = req.headers['x-request-id'] || req.headers['X-Request-Id'];
    // Fallback to existing req.id if set by upstream, else generate
    req.id = headerId || req.id || uuidv4();
    res.setHeader('X-Request-Id', req.id);
    // Optionally log the correlation ID for traceability
    if (process.env.NODE_ENV === 'development') {
        console.log(`Correlation ID: ${req.id} for ${req.method} ${req.originalUrl}`);
    }
    next();
}
