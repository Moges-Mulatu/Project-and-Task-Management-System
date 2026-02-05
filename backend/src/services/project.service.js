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
     * Get all active projects with optional filtering
     * @param {Object} filters - Filter options (teamId, status, priority)
     * @returns {Promise<Array>} List of project instances
     */
    static async getProjects(filters = {}) {
        try {
            return await Project.findAll(filters);
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
     * Update project details
     * @param {string} id - Project ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Project>} Updated project instance
     */
    static async updateProject(id, updateData) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }
            return await project.update(updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a project (soft delete)
     * @param {string} id - Project ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteProject(id) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }
            return await project.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Manually trigger a progress recalculation for a project
     * @param {string} id - Project ID
     * @returns {Promise<Project>} Project with updated progress
     */
    static async refreshProgress(id) {
        try {
            const project = await Project.findById(id);
            if (!project) {
                throw new Error('Project not found');
            }
            return await project.updateProgress();
        } catch (error) {
            throw error;
        }
    }
}

export default ProjectService;
