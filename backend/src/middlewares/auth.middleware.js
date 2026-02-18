import TokenUtil from '../utils/token.util.js';
import User from '../models/user.model.js';
import { sendError } from '../utils/response.util.js';

/**
 * Middleware to verify JWT token
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendError(res, 'Not authorized to access this route', 401);
        }

        try {
            // Verify token
            const decoded = TokenUtil.verifyToken(token);

            // Check if user still exists
            const user = await User.findById(decoded.id);
            if (!user) {
                return sendError(res, 'The user belonging to this token no longer exists', 401);
            }

            // Check if user account is active
            if (!user.isActive) {
                return sendError(res, 'User account is deactivated', 401);
            }

            // Grant access to protected route (use toJSON to exclude password)
            req.user = user.toJSON();
            next();
        } catch (err) {
            return sendError(res, 'Not authorized to access this route', 401);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles 
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 'You do not have permission to perform this action', 403);
        }
        next();
    };
};

export default {
    protect,
    restrictTo
};
