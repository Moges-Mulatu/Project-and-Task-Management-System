import { sendError } from '../utils/response.util.js';

/**
 * Global Validation Middleware
 * Validates request body against a set of rules (schema).
 * @param {Array} rules - List of validation rules
 */
export const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];

        rules.forEach(rule => {
            const value = req.body[rule.field];

            // Check if required
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${rule.field} is required`);
                return;
            }

            // Skip further checks if value is empty and not required
            if (value === undefined || value === null || value === '') return;

            // Check type (simple check)
            if (rule.type === 'string' && typeof value !== 'string') errors.push(`${rule.field} must be a string`);
            if (rule.type === 'number' && typeof value !== 'number') errors.push(`${rule.field} must be a number`);
            if (rule.type === 'email' && !/\S+@\S+\.\S+/.test(value)) errors.push(`${rule.field} must be a valid email`);
            if (rule.type === 'date' && isNaN(Date.parse(value))) errors.push(`${rule.field} must be a valid date`);

            // Check enum
            if (rule.enum && !rule.enum.includes(value)) {
                errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
            }

            // Check minLength
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
            }
        });

        if (errors.length > 0) {
            return sendError(res, `Validation failed: ${errors.join('; ')}`, 400);
        }

        next();
    };
};

export default {
    validate
};
