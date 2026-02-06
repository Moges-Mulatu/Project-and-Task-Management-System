/**
 * Auth Validator
 * Defines validation rules for authentication routes.
 */
class AuthValidator {
    /**
     * Rules for user registration
     */
    static get register() {
        return [
            { field: 'firstName', required: true, type: 'string' },
            { field: 'lastName', required: true, type: 'string' },
            { field: 'email', required: true, type: 'email' },
            { field: 'password', required: true, minLength: 6 }
            // Role is NOT allowed in public registration; will be forced to 'team_member'
        ];
    }

    /**
     * Rules for user login
     */
    static get login() {
        return [
            { field: 'email', required: true, type: 'email' },
            { field: 'password', required: true }
        ];
    }
}

export default AuthValidator;
