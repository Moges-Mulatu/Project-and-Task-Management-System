/**
 * Task Validator
 * Defines validation rules for task routes.
 */
class TaskValidator {
    /**
     * Rules for task creation
     */
    static get create() {
        return [
            { field: 'title', required: true, type: 'string' },
            { field: 'projectId', required: true },
            { field: 'assignedTo', required: true },
            { field: 'deadline', required: true, type: 'date' },
            { field: 'priority', required: false, enum: ['low', 'medium', 'high'] },
            { field: 'type', required: false, enum: ['task', 'bug', 'feature'] }
        ];
    }

    /**
     * Rules for task update
     */
    static get update() {
        return [
            { field: 'title', required: false, type: 'string' },
            { field: 'status', required: false, enum: ['todo', 'in_progress', 'review', 'completed'] },
            { field: 'priority', required: false, enum: ['low', 'medium', 'high'] }
        ];
    }

    /**
     * Rules for adding a comment
     */
    static get addComment() {
        return [
            { field: 'text', required: true, type: 'string' }
        ];
    }
}

export default TaskValidator;
