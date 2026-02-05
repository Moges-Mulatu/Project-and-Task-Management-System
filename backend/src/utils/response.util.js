/**
 * Send a success response
 * @param {Response} res Express response object
 * @param {string} message Success message
 * @param {Object} data Response data
 * @param {number} statusCode HTTP status code
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send an error response
 * @param {Response} res Express response object
 * @param {string} message Error message
 * @param {number} statusCode HTTP status code
 * @param {any} error Raw error object
 */
export const sendError = (res, message, statusCode = 500, error = null) => {
    const response = {
        success: false,
        message
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.details = error.message;
    }

    return res.status(statusCode).json(response);
};

export default {
    sendSuccess,
    sendError
};
