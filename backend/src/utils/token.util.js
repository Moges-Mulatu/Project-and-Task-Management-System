import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config.js';

/**
 * Token Utility
 * Handles JWT signing and verification.
 */
class TokenUtil {
    /**
     * Generate a JWT token for a user
     * @param {Object} payload - Data to include in the token
     * @returns {string} Signed JWT
     */
    static generateToken(payload) {
        return jwt.sign(payload, JWT_CONFIG.SECRET, {
            expiresIn: JWT_CONFIG.EXPIRES_IN
        });
    }

    /**
     * Verify a JWT token
     * @param {string} token - Token to verify
     * @returns {Object} Decoded payload
     */
    static verifyToken(token) {
        return jwt.verify(token, JWT_CONFIG.SECRET);
    }
}

export default TokenUtil;
