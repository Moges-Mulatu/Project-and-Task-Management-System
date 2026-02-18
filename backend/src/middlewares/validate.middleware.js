import { sendError } from '../utils/response.util.js';

/**
 * Global Validation Middleware
 * Validates request body against a set of rules (schema).
 * @param {Array} rules - List of validation rules
 */
export const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];
        const allowedFields = rules.map(r => r.field);
        const receivedFields = Object.keys(req.body);

        // Check for unknown fields
        const unknownFields = receivedFields.filter(field => !allowedFields.includes(field));
        if (unknownFields.length > 0) {
            errors.push(`Unknown fields not allowed: ${unknownFields.join(', ')}`);
        }

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

        // Strip unknown fields from req.body (defense in depth)
        const sanitizedBody = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                sanitizedBody[field] = req.body[field];
            }
        });
        req.body = sanitizedBody;

        next();
    };
};

export default {
    validate
};
