
class ApiResponse {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {any} data - Response data
     * @param {string} [message] - Message for the response
     * @param {object} [options] - Optional metadata (errors, meta, etc.)
     */
    constructor(statusCode, data, message = "Success", options = {}) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.timestamp = new Date().toISOString();
        if (options.errors) this.errors = options.errors;
        if (options.meta) this.meta = options.meta;
        if (options.requestId) this.requestId = options.requestId;
    }
}

export { ApiResponse };
