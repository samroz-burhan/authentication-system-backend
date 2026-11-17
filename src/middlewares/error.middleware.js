import ApiError from "../utils/apiError.js";

export default function errorMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }


    // 1. Default values
    let statusCode = 500;
    let message = "Internal Server Error";

    // 2. Our custom application errors
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // 3. MongoDB duplicate key error
    else if (err.code === 11000) {
        statusCode = 409;
        message = "Resource already exists";
    }

    // 4. Mongoose validation error
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Invalid input";
    }

    // 5. Invalid MongoDB ObjectId
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    else if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Request body must contain valid JSON";
    }

    else if (err.type === "entity.too.large") {
        statusCode = 413;
        message = "Request body is too large";
    }

    // 6. JWT errors
    else if (
        err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError" ||
        err.name === "NotBeforeError"
    ) {
        statusCode = 401;
        message = "Invalid or expired token";
    }

    // 7. Unexpected errors
    else {
        console.error("UNEXPECTED ERROR:", err);
    }

    // 9. Standardized response
    return res.status(statusCode).json({
        success: false,
        message
    })
}
