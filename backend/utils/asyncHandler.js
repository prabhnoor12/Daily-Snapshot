/**
 * Wraps an async route handler and forwards errors to Express error middleware.
 * Supports optional error logging and custom error handling.
 * @param {Function} fn - The async route/controller function
 * @param {Object} [options] - Optional config
 * @param {Function} [options.onError] - Custom error handler (err, req, res, next)
 * @param {Function} [options.logger] - Error logger (err, req)
 */
const asyncHandler = (fn, options = {}) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            if (options.logger) {
                options.logger(err, req);
            }
            if (options.onError) {
                return options.onError(err, req, res, next);
            }
            next(err);
        });
    };
};

export { asyncHandler };
