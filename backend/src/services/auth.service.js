import TokenUtil from '../utils/token.util.js';
import User from '../models/user.model.js';

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData 
     * @returns {Promise<Object>} The created user and token
     */
    static async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Force role to 'team_member' for public registration (security)
            userData.role = 'team_member';

            // Create new user (password hashing happens in the model)
            const user = await User.create(userData);

            // Generate token
            const token = this.generateToken(user);

            return {
                user: user.toJSON(),
                token
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login a user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} The user and token
     */
    static async login(email, password) {
        try {
            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Validate password
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Update last login
            await user.update({ lastLogin: new Date() });

            // Generate token
            const token = this.generateToken(user);

            return {
                user: user.toJSON(),
                token
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate JWT token for a user
     * @param {Object} user 
     * @returns {string} JWT Token
     */
    static generateToken(user) {
        return TokenUtil.generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
    }
}

export default AuthService;
