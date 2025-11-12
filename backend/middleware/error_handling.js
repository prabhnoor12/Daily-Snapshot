
// A simple logger function (you can replace this with a more robust logger like Winston)







import { ApiError } from '../utils/apiError.js';

const logError = (err, req) => {
    const info = {
        method: req?.method,
        url: req?.originalUrl,
        shop: req?.shop?.shop,
        user: req?.user?.id,
        requestId: req?.id,
    };
    console.error('Error:', {
        message: err.message,
        code: err.code || err.name,
        statusCode: err.statusCode || 500,
        info,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

function mapError(err) {
    // Prisma error mapping
    if (err?.code && err.code.startsWith('P')) {
        return {
            statusCode: 400,
            code: 'DB_ERROR',
            message: 'Database error',
            errors: [{ code: err.code, message: err.message }],
        };
    }
    // Zod validation error mapping
    if (err?.name === 'ZodError' && Array.isArray(err.errors)) {
        return {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        };
    }
    // Fallback
    return null;
}

const errorHandler = (err, req, res, next) => {
    logError(err, req);

    // Try to map known error types
    const mapped = mapError(err);
    const statusCode = mapped?.statusCode || (err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500);
    const code = mapped?.code || err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR');
    const errors = mapped?.errors || err.errors || undefined;
    const message = mapped?.message || err.message || 'An unexpected error occurred.';

    // Avoid leaking stack traces in production
    const response = {
        success: false,
        statusCode,
        code,
        message,
        errors,
        requestId: req?.id,
    };
    // If rate limit headers are present, include them in the error response
    if (res.getHeader('Retry-After')) {
        response.retryAfter = res.getHeader('Retry-After');
    }
    if (res.getHeader('X-RateLimit-Limit')) {
        response.rateLimit = {
            limit: res.getHeader('X-RateLimit-Limit'),
            remaining: res.getHeader('X-RateLimit-Remaining'),
            reset: res.getHeader('X-RateLimit-Reset'),
        };
    }
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export { errorHandler };
