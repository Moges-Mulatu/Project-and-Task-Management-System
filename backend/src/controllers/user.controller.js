import UserService from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

/**
 * User Controller
 * Handles HTTP requests related to user profiles and management.
 */
class UserController {
    /**
     * Create a new user (Admin only)
     */
    static async create(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            return sendSuccess(res, 'User created successfully', user, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get the profile of the currently logged-in user
     */
    static async getMyProfile(req, res) {
        try {
            const user = await UserService.getUserById(req.user.id);
            return sendSuccess(res, 'Profile retrieved successfully', user);
        } catch (error) {
            return sendError(res, error.message, 404);
        }
    }

    /**
     * Update the currently logged-in user's profile
     */
    static async updateMyProfile(req, res) {
        try {
            const user = await UserService.updateProfile(req.user.id, req.body, req.user.role);
            return sendSuccess(res, 'Profile updated successfully', user);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all users (Admin only)
     */
    static async getAllUsers(req, res) {
        try {
            const filters = {
                role: req.query.role,
                department: req.query.department
            };
            const users = await UserService.getUsers(filters);
            return sendSuccess(res, 'Users retrieved successfully', users);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    /**
     * Get a specific user by ID (Admin only)
     */
    static async getUser(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            return sendSuccess(res, 'User retrieved successfully', user);
        } catch (error) {
            return sendError(res, error.message, 404);
        }
    }

    /**
     * Deactivate a user (Admin only)
     */
    static async deactivateUser(req, res) {
        try {
            await UserService.deactivateUser(req.params.id, req.user.id);
            return sendSuccess(res, 'User deactivated successfully');
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Update a user's role (Admin only)
     */
    static async updateUserRole(req, res) {
        try {
            const { role } = req.body;
            const user = await UserService.updateUserRole(req.params.id, role);
            return sendSuccess(res, 'User role updated successfully', user);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Reactivate a user (Admin only)
     */
    static async reactivateUser(req, res) {
        try {
            const user = await UserService.reactivateUser(req.params.id);
            return sendSuccess(res, 'User reactivated successfully', user);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Search for users
     */
    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return sendError(res, 'Search query is required', 400);
            }
            const users = await UserService.searchUsers(q);
            return sendSuccess(res, 'Search completed', users);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

export default UserController;
