import { sendError } from '../utils/response.util.js';
import { validate as uuidValidate } from 'uuid';

/**
 * Middleware to validate ID format in URL parameters
 * Allows standard UUIDs or custom seed IDs (e.g., u1-admin-001)
 * @param {string} paramName - Name of the parameter to validate (default: 'id')
 */
export const validateUUID = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        // In development/seed mode, allow custom short IDs like 'ts1-db-001'
        // If it's not a UUID and doesn't look like a valid string ID, then error.
        const isValidSeedId = typeof id === 'string' && id.length >= 2 && id.length <= 50;

        if (id && !uuidValidate(id) && !isValidSeedId) {
            return sendError(res, `Invalid ${paramName} format. Must be a valid UUID or registered Identifier.`, 400);
        }
        next();
    };
};

/**
 * Middleware to validate query parameters
 * @param {Array} rules - Validation rules for query parameters
 */
export const validateQueryParams = (rules) => {
    return (req, res, next) => {
        const errors = [];

        rules.forEach(rule => {
            const value = req.query[rule.field];
            if (rule.required && !value) {
                errors.push(`Query parameter ${rule.field} is required`);
                return;
            }
            if (value && rule.type === 'number' && isNaN(Number(value))) {
                errors.push(`Query parameter ${rule.field} must be a number`);
            }
            if (value && rule.type === 'uuid') {
                const isValidId = uuidValidate(value) || (typeof value === 'string' && value.length >= 2 && value.length <= 50);
                if (!isValidId) {
                    errors.push(`Query parameter ${rule.field} must be a valid UUID or registered Identifier`);
                }
            }
            if (value && rule.enum && !rule.enum.includes(value)) {
                errors.push(`Query parameter ${rule.field} must be one of: ${rule.enum.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            return sendError(res, `Query validation failed: ${errors.join('; ')}`, 400);
        }
        next();
    };
};

export default {
    validateUUID,
    validateQueryParams
};

