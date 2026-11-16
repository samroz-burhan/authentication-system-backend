class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        
        this.statusCode = statusCode;
        this.isOperational = true;
        this.name = "ApiError";

        Error.captureStackTrace(this, this.constructor)
    }

}

export default ApiError

