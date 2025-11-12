
import { ApiError } from '../utils/apiError.js';
import { z } from 'zod';

// Factory to create validation middleware for body, query, params
export function validate(schemas = {}) {
    return async (req, res, next) => {
        try {
            // Support async Zod schemas
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            next();
        } catch (err) {
            if (err instanceof z.ZodError) {
                // Map Zod errors to ApiError with details
                const errors = err.errors.map(e => ({
                    path: Array.isArray(e.path) ? e.path.join('.') : e.path,
                    message: e.message,
                    code: e.code || undefined
                }));
                return next(new ApiError(400, 'Validation failed', errors, 'VALIDATION_ERROR'));
            }
            next(err);
        }
    };
}
