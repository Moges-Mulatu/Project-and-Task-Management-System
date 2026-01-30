import { sendError } from '../utils/response.util.js';

/**
 * Higher-level Role Access Middleware
 */
export const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 'Access denied: Insufficient permissions', 403);
        }
        next();
    };
};

export default {
    checkRole
};
