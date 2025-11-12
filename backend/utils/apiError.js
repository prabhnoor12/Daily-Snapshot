class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        isOperational = true, // Flag for operational vs. programmer errors
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.isOperational = isOperational;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Represents a 400 Bad Request error.
 */
class BadRequestError extends ApiError {
    constructor(message = "Bad Request", errors = {}) { // Default to an object
        super(400, message, true, errors);
    }
}

/**
 * Represents a 401 Unauthorized error.
 */
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized", errors = []) {
        super(401, message, true, errors);
    }
}

/**
 * Represents a 403 Forbidden error.
 */
class ForbiddenError extends ApiError {
    constructor(message = "Forbidden", errors = []) {
        super(403, message, true, errors);
    }
}

/**
 * Represents a 404 Not Found error.
 */
class NotFoundError extends ApiError {
    constructor(message = "Not Found", errors = []) {
        super(404, message, true, errors);
    }
}

export {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
};
