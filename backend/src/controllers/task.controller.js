import TaskService from '../services/task.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

/**
 * Task Controller
 * Handles HTTP requests related to task management, assignment, and collaboration.
 */
class TaskController {
    /**
     * Create a new task
     */
    static async create(req, res) {
        try {
            const taskData = {
                ...req.body,
                assignedBy: req.user.id
            };
            const task = await TaskService.createTask(taskData, req.user.id, req.user.role);
            return sendSuccess(res, 'Task created successfully', task, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all tasks with role-based visibility
     */
    static async getAll(req, res) {
        try {
            const filters = {
                projectId: req.query.projectId,
                projectManagerId: req.query.projectManagerId,
                assignedTo: req.query.assignedTo,
                status: req.query.status,
                priority: req.query.priority,
                type: req.query.type,
                userRole: req.user.role,
                requesterId: req.user.id
            };
            const tasks = await TaskService.getTasks(filters);
            return sendSuccess(res, 'Tasks retrieved successfully', tasks);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    /**
     * Get task by ID
     */
    static async getById(req, res) {
        try {
            const task = await TaskService.getTaskById(req.params.id, req.user.id, req.user.role);
            return sendSuccess(res, 'Task retrieved successfully', task);
        } catch (error) {
            return sendError(res, error.message, 404);
        }
    }

    /**
     * Update task details
     */
    static async update(req, res) {
        try {
            const task = await TaskService.updateTask(req.params.id, req.body, req.user.id, req.user.role);
            return sendSuccess(res, 'Task updated successfully', task);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Delete a task
     */
    static async delete(req, res) {
        try {
            await TaskService.deleteTask(req.params.id, req.user.id, req.user.role);
            return sendSuccess(res, 'Task deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Add a comment to a task
     */
    static async addComment(req, res) {
        try {
            const comment = {
                text: req.body.text,
                userId: req.user.id
            };
            const task = await TaskService.addComment(req.params.id, comment, req.user.id, req.user.role);
            return sendSuccess(res, 'Comment added successfully', task);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Add an attachment to a task
     */
    static async addAttachment(req, res) {
        try {
            const attachment = {
                ...req.body,
                uploadedBy: req.user.id
            };
            const task = await TaskService.addAttachment(req.params.id, attachment, req.user.id, req.user.role);
            return sendSuccess(res, 'Attachment added successfully', task);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }
}

export default TaskController;
