/**
 * User Validator
 * Defines validation rules for user management routes.
 */
class UserValidator {
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
}

export default UserValidator;
