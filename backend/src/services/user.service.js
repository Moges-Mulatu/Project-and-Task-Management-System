import User from '../models/user.model.js';
import { getDBConnection } from '../config/db.config.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * User Service
 * Handles business logic for user management, profiles, and administration.
 */
class UserService {
    /**
     * Create a new user (Admin only)
     */
    static async createUser(userData) {
        try {
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists');
            }
            const user = await User.create(userData);
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

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
     * Get allowed update fields based on requester role
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Array} List of allowed field names
     */
    static getAllowedUpdateFields(requesterRole) {
        const baseFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'avatar'];
        // Only admin can update role, isActive
        if (requesterRole === ROLES.ADMIN) {
            return [...baseFields, 'role', 'isActive'];
        }
        return baseFields;
    }

    /**
     * Update a user's profile information
     * @param {string} id - User ID
     * @param {Object} updateData - Data to update
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Object>} Updated user object
     */
    static async updateProfile(id, updateData, requesterRole = ROLES.TEAM_MEMBER) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Whitelist allowed fields based on requester role
            const allowedFields = this.getAllowedUpdateFields(requesterRole);
            const filteredData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            // Never allow password update through this method
            delete filteredData.password;

            await user.update(filteredData);
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deactivate a user (soft delete)
     * @param {string} id - User ID
     * @param {string} requesterId - ID of the admin making the request
     * @returns {Promise<boolean>} Success status
     */
    static async deactivateUser(id, requesterId) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Prevent admins from deleting other admins
            if (user.role === ROLES.ADMIN && user.id !== requesterId) {
                throw new Error('Cannot delete other admin users');
            }
            
            return await user.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update a user's role (Admin only)
     * @param {string} id - User ID
     * @param {string} role - New role
     * @returns {Promise<Object>} Updated user object
     */
    static async updateUserRole(id, role) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            await user.update({ role });
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reactivate a user (Admin only)
     * @param {string} id - User ID
     * @returns {Promise<Object>} Updated user object
     */
    static async reactivateUser(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            await user.update({ isActive: true });
            return user.toJSON();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search for users by name or email
     * @param {string} query - Search query string
     * @returns {Promise<Array>} List of matching user objects
     */
    static async searchUsers(query) {
        try {
            const connection = getDBConnection();
            const searchQuery = `
                SELECT * FROM users 
                WHERE isActive = 1 
                AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)
                ORDER BY createdAt DESC
            `;
            const searchTerm = `%${query}%`;
            const [rows] = await connection.execute(searchQuery, [searchTerm, searchTerm, searchTerm]);
            return rows.map(row => {
                const user = new User(row);
                return user.toJSON();
            });
        } catch (error) {
            throw new Error(`Error searching users: ${error.message}`);
        }
    }
}

export default UserService;
