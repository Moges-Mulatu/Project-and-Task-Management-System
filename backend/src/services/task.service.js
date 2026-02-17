import Task from '../models/task.model.js';

/**
 * Task Service
 * Handles business logic for task management, attribution, and collaboration.
 */
class TaskService {
    /**
     * Create a new task within a project
     * @param {Object} taskData - Task details
     * @returns {Promise<Task>} Created task instance
     */
    static async createTask(taskData) {
        try {
            return await Task.create(taskData);
        } catch (error) {
            throw new Error(`Error creating task: ${error.message}`);
        }
    }

    /**
     * Get all active tasks with optional filtering
     * @param {Object} filters - Filter options (projectId, assignedTo, status, priority, type)
     * @returns {Promise<Array>} List of task instances
     */
    static async getTasks(filters = {}) {
        try {
            return await Task.findAll(filters);
        } catch (error) {
            throw new Error(`Error fetching tasks: ${error.message}`);
        }
    }

    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Promise<Task>} Task instance
     */
    static async getTaskById(id) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }
            return task;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update task details (status, assignment, etc.)
     * @param {string} id - Task ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Task>} Updated task instance
     */
    static async updateTask(id, updateData) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }
            return await task.update(updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a task (soft delete)
     * @param {string} id - Task ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteTask(id) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }
            return await task.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add a comment to a task
     * @param {string} taskId - Task ID
     * @param {Object} comment - Comment object (text, userId)
     * @returns {Promise<Task>} Updated task instance
     */
    static async addComment(taskId, comment) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            return await task.addComment(comment);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add an attachment to a task
     * @param {string} taskId - Task ID
     * @param {Object} attachment - Attachment data
     * @returns {Promise<Task>} Updated task instance
     */
    static async addAttachment(taskId, attachment) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            return await task.addAttachment(attachment);
        } catch (error) {
            throw error;
        }
    }
}

export default TaskService;
