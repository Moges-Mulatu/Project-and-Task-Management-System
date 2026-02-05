import TaskService from '../services/task.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import { ROLES } from '../constants/roles.constants.js';

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
            const task = await TaskService.createTask(taskData);
            return sendSuccess(res, 'Task created successfully', task, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all tasks
     */
    static async getAll(req, res) {
        try {
            const filters = {
                projectId: req.query.projectId,
                assignedTo: req.query.assignedTo,
                status: req.query.status,
                priority: req.query.priority,
                type: req.query.type
            };

            // Team Members only see their assigned tasks
            if (req.user.role === ROLES.TEAM_MEMBER) {
                filters.assignedTo = req.user.id;
            }

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
            const task = await TaskService.getTaskById(req.params.id);
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
            const task = await TaskService.getTaskById(req.params.id);
            if (!task) {
                return sendError(res, 'Task not found', 404);
            }

            // Role-based Permission Audit
            if (req.user.role === ROLES.TEAM_MEMBER) {
                // Team members can only update tasks assigned to them
                if (task.assignedTo !== req.user.id) {
                    return sendError(res, 'You can only update tasks assigned to you', 403);
                }

                // Team members can only update status and progress
                const allowedFields = ['status', 'progress'];
                const updateKeys = Object.keys(req.body);
                const isOnlyAllowedFields = updateKeys.every(key => allowedFields.includes(key));

                if (!isOnlyAllowedFields) {
                    return sendError(res, 'Team members can only update status and progress', 403);
                }
            }

            const updatedTask = await TaskService.updateTask(req.params.id, req.body);
            return sendSuccess(res, 'Task updated successfully', updatedTask);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Delete a task
     */
    static async delete(req, res) {
        try {
            await TaskService.deleteTask(req.params.id);
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
            const task = await TaskService.addComment(req.params.id, comment);
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
            const task = await TaskService.addAttachment(req.params.id, attachment);
            return sendSuccess(res, 'Attachment added successfully', task);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }
}

export default TaskController;
