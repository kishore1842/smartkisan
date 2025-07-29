import mongoose from 'mongoose';

class ErrorHandler extends Error {
    constructor(message, statuscode) {
        super(message);
        this.statuscode = statuscode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal server error";
    err.statuscode = err.statuscode || 500;

    // Log error for debugging
    console.error('Error Details:', {
        message: err.message,
        statusCode: err.statuscode,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        err.statuscode = 400;
        const field = Object.keys(err.keyValue)[0];
        err.message = `${field} already exists. Please use a different value.`;
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        err.statuscode = 401;
        err.message = "Invalid token. Please log in again.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    if (err.name === "TokenExpiredError") {
        err.statuscode = 401;
        err.message = "Token expired. Please log in again.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle MongoDB cast errors (invalid ObjectId)
    if (err.name === "CastError") {
        err.statuscode = 400;
        err.message = `Invalid ${err.path}: ${err.value}`;
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
        err.statuscode = 400;
        const messages = Object.values(err.errors).map(error => error.message);
        err.message = messages.join(", ");
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle file upload errors
    if (err.code === "LIMIT_FILE_SIZE") {
        err.statuscode = 400;
        err.message = "File size too large. Please upload a smaller file.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        err.statuscode = 400;
        err.message = "Unexpected file field. Please check your upload.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle network errors
    if (err.code === "ECONNREFUSED") {
        err.statuscode = 503;
        err.message = "Service temporarily unavailable. Please try again later.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    // Handle timeout errors
    if (err.code === "ETIMEDOUT") {
        err.statuscode = 408;
        err.message = "Request timeout. Please try again.";
        err = new ErrorHandler(err.message, err.statuscode);
    }

    const errorMessage = err.errors ? Object.values(err.errors).map(error => error.message).join(" ") : err.message;

    return res.status(err.statuscode).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

export default ErrorHandler;