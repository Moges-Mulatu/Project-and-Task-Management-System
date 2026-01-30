import bcrypt from 'bcryptjs';

/**
 * Hash Utility
 * Handles password hashing and verification using bcrypt.
 */
class HashUtil {
    /**
     * Hash a plain text string
     * @param {string} text - Text to hash
     * @returns {Promise<string>} Hashed string
     */
    static async hash(text) {
        return await bcrypt.hash(text, 12);
    }

    /**
     * Compare plain text with a hash
     * @param {string} text - Plain text
     * @param {string} hash - Hashed value
     * @returns {Promise<boolean>} True if match
     */
    static async compare(text, hash) {
        return await bcrypt.compare(text, hash);
    }
}

export default HashUtil;
