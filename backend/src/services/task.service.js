import Task from '../models/task.model.js';

/**
 * Task Service
 * Handles business logic for task management, attribution, and collaboration.
 */
class TaskService {
    /**
     * Create a new task within a project with ownership check
     * @param {Object} taskData - Task details
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Task>} Created task instance
     */
    static async createTask(taskData, requesterId, requesterRole) {
        try {
            // Fetch project to verify ownership
            const Project = (await import('../models/project.model.js')).default;
            const project = await Project.findById(taskData.projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Ownership check: only admin or the assigned PM can create tasks in the project
            if (requesterRole !== 'admin' && project.projectManagerId !== requesterId) {
                throw new Error('You can only create tasks in projects you manage');
            }

            return await Task.create(taskData);
        } catch (error) {
            throw new Error(`Error creating task: ${error.message}`);
        }
    }

    /**
     * Get all active tasks with optional filtering and role-based visibility
     * @param {Object} filters - Filter options (projectId, assignedTo, status, priority, type) and user context
     * @returns {Promise<Array>} List of task instances
     */
    static async getTasks(filters = {}) {
        try {
            let queryOptions = { ...filters };

            // If user is team_member, restrict to their assigned tasks only
            if (filters.userRole === 'team_member' && filters.requesterId) {
                queryOptions.assignedTo = filters.requesterId;
            }

            // PM and Admin can see broader task lists; optionally filter by projectId if provided
            return await Task.findAll(queryOptions);
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
     * Update task details with role-based authorization
     * @param {string} id - Task ID
     * @param {Object} updateData - Data to update
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Task>} Updated task instance
     */
    static async updateTask(id, updateData, requesterId, requesterRole) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }

            // Authorization check
            if (requesterRole === 'team_member') {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only update tasks assigned to you');
                }
            } else if (requesterRole === 'project_manager') {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only update tasks in projects you manage');
                }
            }

            // Admin can update any task
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
