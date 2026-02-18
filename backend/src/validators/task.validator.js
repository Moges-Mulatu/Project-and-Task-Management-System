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
            { field: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] },
            { field: 'type', required: false, enum: ['task', 'bug', 'feature'] },
            { field: 'description', required: false, type: 'string' },
            { field: 'estimatedHours', required: false, type: 'number' }
        ];
    }

    /**
     * Rules for task update
     */
    static get update() {
        return [
            { field: 'title', required: false, type: 'string' },
            { field: 'description', required: false, type: 'string' },
            { field: 'status', required: false, enum: ['todo', 'in_progress', 'review', 'completed', 'blocked'] },
            { field: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] },
            { field: 'progress', required: false, type: 'number' },
            { field: 'assignedTo', required: false, type: 'string' },
            { field: 'dueDate', required: false, type: 'date' },
            { field: 'estimatedHours', required: false, type: 'number' },
            { field: 'actualHours', required: false, type: 'number' },
            { field: 'type', required: false, enum: ['task', 'bug', 'feature'] },
            { field: 'tags', required: false },
            { field: 'storyPoints', required: false, type: 'number' },
            { field: 'startDate', required: false, type: 'date' }
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

    /**
     * Rules for adding an attachment
     */
    static get addAttachment() {
        return [
            { field: 'filename', required: true, type: 'string' },
            { field: 'url', required: true, type: 'string' },
            { field: 'size', required: false, type: 'number' }
        ];
    }
}

export default TaskValidator;
