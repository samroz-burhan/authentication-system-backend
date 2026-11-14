export default function errorMiddleware (err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let errorMessage = err.message || "Internal Server Error";

    //Handle unexpected errors
    if(!err.isOperational) {
        statusCode = 500
        errorMessage = "Internal Server Error"
    }

    //MongoDB duplication error
    if(err.code === 11000) {
        statusCode = 409;
        errorMessage = "Username or Email already exists";
    }

    //Mongoose Validation Error
    if(err.name === "ValidationError") {
        statusCode = 400;
        errorMessage = err.message
    }

    // Mongoose invalid ObjectId
    if(err.name === "CastError") {
        statusCode = 400;
        errorMessage = "Invalid resource ID"
    }
    
    
    return res.status(statusCode).json({
        message: errorMessage
    });

}