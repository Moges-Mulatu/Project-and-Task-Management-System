/**
 * User Validator
 * Defines validation rules for user management routes.
 */
class UserValidator {
    /**
     * Rules for creating a user (Admin only)
     */
    static get create() {
        return [
            { field: 'firstName', required: true, type: 'string' },
            { field: 'lastName', required: true, type: 'string' },
            { field: 'email', required: true, type: 'email' },
            { field: 'password', required: true, minLength: 6 },
            { field: 'role', required: true, enum: ['admin', 'project_manager', 'team_member'] }
        ];
    }
    /**
     * Rules for updating user profile
     */
    static get updateProfile() {
        return [
            { field: 'firstName', required: false, type: 'string' },
            { field: 'lastName', required: false, type: 'string' },
            { field: 'email', required: false, type: 'email' }
        ];
    }

    /**
     * Rules for updating user role (Admin only)
     */
    static get updateRole() {
        return [
            { field: 'role', required: true, enum: ['admin', 'project_manager', 'team_member'] }
        ];
    }
}

export default UserValidator;
