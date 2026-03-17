/**
 * Project Validator
 * Defines validation rules for project routes.
 */
class ProjectValidator {
    /**
     * Rules for project creation
     */
    static get create() {
        return [
            { field: 'name', required: true, type: 'string' },
            { field: 'description', required: true, type: 'string' },
            { field: 'teamId', required: true },
            { field: 'projectManagerId', required: false, type: 'string' },
            { field: 'startDate', required: true, type: 'date' },
            { field: 'endDate', required: true, type: 'date' },
            { field: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] },
            { field: 'status', required: false, enum: ['planning', 'active', 'on_hold', 'completed'] }
        ];
    }

    /**
     * Rules for project update
     */
    static get update() {
        return [
            { field: 'name', required: false, type: 'string' },
            { field: 'description', required: false, type: 'string' },
            { field: 'projectManagerId', required: false, type: 'string' },
            { field: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] },
            { field: 'status', required: false, enum: ['planning', 'active', 'on_hold', 'completed'] }
        ];
    }
}

export default ProjectValidator;
