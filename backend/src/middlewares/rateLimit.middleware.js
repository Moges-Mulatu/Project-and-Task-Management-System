import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes (login, register)
 * Prevents brute-force attacks
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development
    // Return a JSON response so clients expecting application/json can parse it
    handler: (req, res /*, next */) => {
        return res.status(429).json({ success: false, message: 'Too many login attempts, please try again later' });
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

/**
 * General rate limiter for API routes
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    authRateLimiter,
    generalRateLimiter
};

