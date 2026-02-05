import Project from '../models/project.model.js';

/**
 * Project Service
 * Handles business logic for project management, tracking, and reporting.
 */
class ProjectService {
    /**
     * Create a new project
     * @param {Object} projectData - Project details
     * @returns {Promise<Project>} Created project instance
     */
    static async createProject(projectData) {
        try {
            return await Project.create(projectData);
        } catch (error) {
            throw new Error(`Error creating project: ${error.message}`);
        }
    }

    /**
     * Get all active projects with optional filtering and role-based visibility
     * @param {Object} options - Filter options (teamId, status, priority) and user context
     * @returns {Promise<Array>} List of project instances
     */
    static async getProjects(options = {}) {
        try {
            let queryOptions = { ...options };

            // If user is team_member, restrict to their team's projects
            if (options.userRole === 'team_member' && options.userTeamIds && options.userTeamIds.length > 0) {
                queryOptions.teamId = options.userTeamIds;
            }

            // If user is project_manager, restrict to projects they manage (optional)
            if (options.userRole === 'project_manager' && options.projectManagerId) {
                queryOptions.projectManagerId = options.projectManagerId;
            }

            return await Project.findAll(queryOptions);
        } catch (error) {
            throw new Error(`Error fetching projects: ${error.message}`);
        }
    }

    /**
     * Get project by ID
     * @param {string} id - Project ID
     * @returns {Promise<Project>} Project instance
     */
    static async getProjectById(id) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }
            return project;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update project details with ownership check
     * @param {string} id - Project ID
     * @param {Object} updateData - Data to update
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Project>} Updated project instance
     */
    static async updateProject(id, updateData, requesterId, requesterRole) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }

            // Ownership check: only admin or the assigned PM can update
            if (requesterRole !== 'admin' && project.projectManagerId !== requesterId) {
                throw new Error('You can only update projects you manage');
            }

            return await project.update(updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a project (soft delete) with ownership check
     * @param {string} id - Project ID
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<boolean>} Success status
     */
    static async deleteProject(id, requesterId, requesterRole) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }

            // Ownership check: only admin or the assigned PM can delete
            if (requesterRole !== 'admin' && project.projectManagerId !== requesterId) {
                throw new Error('You can only delete projects you manage');
            }

            return await project.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Manually trigger a progress recalculation for a project with ownership check
     * @param {string} id - Project ID
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Project>} Project with updated progress
     */
    static async refreshProgress(id, requesterId, requesterRole) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }

            // Ownership check: only admin or the assigned PM can refresh progress
            if (requesterRole !== 'admin' && project.projectManagerId !== requesterId) {
                throw new Error('You can only refresh progress for projects you manage');
            }

            return await project.updateProgress();
        } catch (error) {
            throw error;
        }
    }
}

export default ProjectService;
