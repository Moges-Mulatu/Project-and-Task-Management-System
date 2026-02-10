import Task from '../models/task.model.js';
import { ROLES } from '../constants/roles.constants.js';

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
            if (requesterRole !== ROLES.ADMIN && project.projectManagerId !== requesterId) {
                throw new Error('You can only create tasks in projects you manage');
            }

            // Validate assignedTo user exists
            if (taskData.assignedTo) {
                const User = (await import('../models/user.model.js')).default;
                const assignedUser = await User.findById(taskData.assignedTo);
                if (!assignedUser) {
                    throw new Error('Assigned user not found');
                }

                // Validate assignedTo user is a member of the project's team
                const TeamMember = (await import('../models/teamMember.model.js')).default;
                const membership = await TeamMember.findMembership(project.teamId, taskData.assignedTo);
                if (!membership || !membership.isActive) {
                    throw new Error('Assigned user must be an active member of the project\'s team');
                }
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
            if (filters.userRole === ROLES.TEAM_MEMBER && filters.requesterId) {
                queryOptions.assignedTo = filters.requesterId;
            }

            // If user is project_manager, restrict to tasks in projects they manage
            if (filters.userRole === ROLES.PROJECT_MANAGER && filters.requesterId) {
                queryOptions.projectManagerId = filters.requesterId;
            }

            // PM and Admin can see broader task lists; optionally filter by projectId if provided
            return await Task.findAll(queryOptions);
        } catch (error) {
            throw new Error(`Error fetching tasks: ${error.message}`);
        }
    }

    /**
     * Get task by ID with role-based visibility check
     * @param {string} id - Task ID
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Task>} Task instance
     */
    static async getTaskById(id, requesterId, requesterRole) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }

            // Visibility check
            if (requesterRole === ROLES.TEAM_MEMBER) {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only view tasks assigned to you');
                }
            } else if (requesterRole === ROLES.PROJECT_MANAGER) {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only view tasks in projects you manage');
                }
            }
            // Admin can view any task

            return task;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get allowed update fields for tasks based on role
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Array} List of allowed field names
     */
    static getAllowedUpdateFields(requesterRole) {
        const baseFields = ['title', 'description', 'status', 'priority', 'progress', 'dueDate', 'estimatedHours', 'actualHours', 'tags'];
        // PM and Admin can also update assignedTo
        if (requesterRole === ROLES.PROJECT_MANAGER || requesterRole === ROLES.ADMIN) {
            return [...baseFields, 'assignedTo', 'type', 'storyPoints', 'startDate'];
        }
        return baseFields;
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
            if (requesterRole === ROLES.TEAM_MEMBER) {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only update tasks assigned to you');
                }
            } else if (requesterRole === ROLES.PROJECT_MANAGER) {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only update tasks in projects you manage');
                }
            }

            // Whitelist allowed fields based on role
            const allowedFields = this.getAllowedUpdateFields(requesterRole);
            const filteredData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            // If assignedTo is being changed, re-validate the user and membership
            if (filteredData.assignedTo !== undefined && filteredData.assignedTo !== task.assignedTo) {
                const User = (await import('../models/user.model.js')).default;
                const assignedUser = await User.findById(filteredData.assignedTo);
                if (!assignedUser) {
                    throw new Error('Assigned user not found');
                }

                const TeamMember = (await import('../models/teamMember.model.js')).default;
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (!project) {
                    throw new Error('Related project not found');
                }

                const membership = await TeamMember.findMembership(project.teamId, filteredData.assignedTo);
                if (!membership || !membership.isActive) {
                    throw new Error('Assigned user must be an active member of the project\'s team');
                }
            }

            // Prevent changing protected fields
            delete filteredData.projectId;
            delete filteredData.assignedBy;
            delete filteredData.id;
            delete filteredData.createdAt;

            return await task.update(filteredData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a task (soft delete) with ownership check
     * @param {string} id - Task ID
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<boolean>} Success status
     */
    static async deleteTask(id, requesterId, requesterRole) {
        try {
            const task = await Task.findById(id);
            if (!task) {
                throw new Error('Task not found');
            }

            // Authorization check
            if (requesterRole === ROLES.TEAM_MEMBER) {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only delete tasks assigned to you');
                }
            } else if (requesterRole === ROLES.PROJECT_MANAGER) {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only delete tasks in projects you manage');
                }
            }
            // Admin can delete any task

            return await task.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add a comment to a task with access check
     * @param {string} taskId - Task ID
     * @param {Object} comment - Comment object (text, userId)
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Task>} Updated task instance
     */
    static async addComment(taskId, comment, requesterId, requesterRole) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Access check
            if (requesterRole === ROLES.TEAM_MEMBER) {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only comment on tasks assigned to you');
                }
            } else if (requesterRole === ROLES.PROJECT_MANAGER) {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only comment on tasks in projects you manage');
                }
            }
            // Admin can comment on any task

            return await task.addComment(comment);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add an attachment to a task with access check
     * @param {string} taskId - Task ID
     * @param {Object} attachment - Attachment data
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Task>} Updated task instance
     */
    static async addAttachment(taskId, attachment, requesterId, requesterRole) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Access check
            if (requesterRole === ROLES.TEAM_MEMBER) {
                if (task.assignedTo !== requesterId) {
                    throw new Error('You can only add attachments to tasks assigned to you');
                }
            } else if (requesterRole === ROLES.PROJECT_MANAGER) {
                // Fetch project to verify PM ownership
                const Project = (await import('../models/project.model.js')).default;
                const project = await Project.findById(task.projectId);
                if (project && project.projectManagerId !== requesterId) {
                    throw new Error('You can only add attachments to tasks in projects you manage');
                }
            }
            // Admin can add attachments to any task

            return await task.addAttachment(attachment);
        } catch (error) {
            throw error;
        }
    }
}

export default TaskService;
