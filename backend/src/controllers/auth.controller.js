import AuthService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

class AuthController {
    /**
     * Register a new user
     */
    static async register(req, res) {
        try {
            const { user, token } = await AuthService.register(req.body);

            return sendSuccess(res, 'User registered successfully', { user, token }, 201);
        } catch (error) {
            const statusCode = error.message === 'User already exists' ? 400 : 500;
            return sendError(res, error.message, statusCode, error);
        }
    }

    /**
     * Login a user
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, 'Email and password are required', 400);
            }

            const { user, token } = await AuthService.login(email, password);

            return sendSuccess(res, 'Login successful', { user, token });
        } catch (error) {
            const statusCode = error.message === 'Invalid email or password' ? 401 : 500;
            return sendError(res, error.message, statusCode, error);
        }
    }
}

export default AuthController;
