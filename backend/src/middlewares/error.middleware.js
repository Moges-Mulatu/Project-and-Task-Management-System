import { sendError } from '../utils/response.util.js';

/**
 * Global Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return sendError(res, err.message, err.statusCode, err.stack);
    }

    // Production environment
    let error = { ...err };
    error.message = err.message;

    // Handle specific operational errors (e.g., JWT, Validation)
    if (error.name === 'JsonWebTokenError') error.message = 'Invalid token. Please log in again.';
    if (error.name === 'TokenExpiredError') error.message = 'Your token has expired! Please log in again.';

    return sendError(res, error.message || 'Something went wrong!', error.statusCode);
};

export default errorMiddleware;
