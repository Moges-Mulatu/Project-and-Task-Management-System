import User from '../models/user.model.js';

/**
 * User Service
 * Handles business logic for user management, profiles, and administration.
 */
class UserService {
    /**
     * Get all active users in the system with optional filtering
     * @param {Object} filters - Filter options (role, department)
     * @returns {Promise<Array>} List of user objects
     */
    static async getUsers(filters = {}) {
        try {
            const users = await User.findAll(filters);
            return users.map(user => user.toJSON());
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    /**
     * Get a specific user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object>} User object
     */
    static async getUserById(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a user's profile information
     * @param {string} id - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user object
     */
    static async updateProfile(id, updateData) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Prevent sensitive field updates directly through profile update if necessary
            // For now, allow everything except password (which should be handled separately)
            delete updateData.password;

            await user.update(updateData);
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deactivate a user (soft delete)
     * @param {string} id - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async deactivateUser(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return await user.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search for users based on a query string
     * @param {string} query - Name or email fragment
     * @returns {Promise<Array>} List of matching users
     */
    static async searchUsers(query) {
        // Implementation for searching users - could be added to Model first
        // For now, we'll keep it simple
        const users = await User.findAll();
        return users
            .filter(u =>
                u.firstName.toLowerCase().includes(query.toLowerCase()) ||
                u.lastName.toLowerCase().includes(query.toLowerCase()) ||
                u.email.toLowerCase().includes(query.toLowerCase())
            )
            .map(u => u.toJSON());
    }
}

export default UserService;
