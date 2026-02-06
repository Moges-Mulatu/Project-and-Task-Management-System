import ProjectService from '../services/project.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

/**
 * Project Controller
 * Handles HTTP requests related to project management and tracking.
 */
class ProjectController {
    /**
     * Create a new project
     */
    static async create(req, res) {
        try {
            const projectData = {
                ...req.body,
                projectManagerId: req.user.id // Default to the creator as PM
            };
            const project = await ProjectService.createProject(projectData);
            return sendSuccess(res, 'Project created successfully', project, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all projects with role-based visibility
     */
    static async getAll(req, res) {
        try {
            const filters = {
                teamId: req.query.teamId,
                status: req.query.status,
                priority: req.query.priority,
                userRole: req.user.role,
                userTeamIds: req.user.teamIds || [], // You may need to populate this in auth middleware or fetch here
                projectManagerId: req.user.role === 'project_manager' ? req.user.id : undefined
            };
            const projects = await ProjectService.getProjects(filters);
            return sendSuccess(res, 'Projects retrieved successfully', projects);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    /**
     * Get project by ID
     */
    static async getById(req, res) {
        try {
            const project = await ProjectService.getProjectById(req.params.id);
            return sendSuccess(res, 'Project retrieved successfully', project);
        } catch (error) {
            return sendError(res, error.message, 404);
        }
    }

    /**
     * Update project details
     */
    static async update(req, res) {
        try {
            const project = await ProjectService.updateProject(req.params.id, req.body, req.user.id, req.user.role);
            return sendSuccess(res, 'Project updated successfully', project);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Delete a project
     */
    static async delete(req, res) {
        try {
            await ProjectService.deleteProject(req.params.id, req.user.id, req.user.role);
            return sendSuccess(res, 'Project deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Refresh project progress
     */
    static async refreshProgress(req, res) {
        try {
            const project = await ProjectService.refreshProgress(req.params.id, req.user.id, req.user.role);
            return sendSuccess(res, 'Project progress updated', { progress: project.progress });
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }
}

export default ProjectController;
