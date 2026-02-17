import Project from "../models/project.model.js";
import { ROLES } from "../constants/roles.constants.js";

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
      // Validate teamId exists
      if (projectData.teamId) {
        const Team = (await import("../models/team.model.js")).default;
        const team = await Team.findById(projectData.teamId);
        if (!team) {
          throw new Error("Team not found");
        }
      }

      // Validate projectManagerId exists
      if (projectData.projectManagerId) {
        const User = (await import("../models/user.model.js")).default;
        const pm = await User.findById(projectData.projectManagerId);
        if (!pm) {
          throw new Error("Project manager not found");
        }
      }

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
      if (
        options.userRole === ROLES.TEAM_MEMBER &&
        options.userTeamIds &&
        options.userTeamIds.length > 0
      ) {
        queryOptions.teamId = options.userTeamIds;
      }

      // If user is project_manager, restrict to projects they manage (optional)
      if (
        options.userRole === ROLES.PROJECT_MANAGER &&
        options.projectManagerId
      ) {
        queryOptions.projectManagerId = options.projectManagerId;
      }

      return await Project.findAll(queryOptions);
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  }

  /**
   * Get project by ID with role-based visibility check
   * @param {string} id - Project ID
   * @param {string} requesterId - ID of the user making the request
   * @param {string} requesterRole - Role of the user making the request
   * @param {Array} userTeamIds - Array of team IDs the user belongs to (for team_member role)
   * @returns {Promise<Project>} Project instance
   */
  static async getProjectById(
    id,
    requesterId,
    requesterRole,
    userTeamIds = [],
  ) {
    try {
      const project = await Project.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      // Visibility check
      if (requesterRole === ROLES.TEAM_MEMBER) {
        if (!userTeamIds.includes(project.teamId)) {
          throw new Error("You can only view projects in your teams");
        }
      } else if (requesterRole === ROLES.PROJECT_MANAGER) {
        if (project.projectManagerId !== requesterId) {
          throw new Error("You can only view projects you manage");
        }
      }
      // Admin can view any project

      return project;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get allowed update fields for projects
   * @returns {Array} List of allowed field names
   */
  static getAllowedUpdateFields() {
    return [
      "name",
      "description",
      "status",
      "priority",
      "startDate",
      "endDate",
      "estimatedEndDate",
      "budget",
      "repositoryUrl",
      "documentationUrl",
      "tags",
    ];
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
        throw new Error("Project not found");
      }

      // Ownership check: only the assigned PM can update
      if (project.projectManagerId !== requesterId) {
        throw new Error("You can only update projects you manage");
      }

      // Whitelist allowed fields
      const allowedFields = this.getAllowedUpdateFields();
      const filteredData = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      // Prevent changing projectManagerId or teamId through update
      delete filteredData.projectManagerId;
      delete filteredData.teamId;
      delete filteredData.id;
      delete filteredData.createdAt;

      return await project.update(filteredData);
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
        throw new Error("Project not found");
      }

      // Ownership check: admins can delete any project, PMs can only delete their own
      if (
        requesterRole !== ROLES.ADMIN &&
        project.projectManagerId !== requesterId
      ) {
        throw new Error("You can only delete projects you manage");
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
        throw new Error("Project not found");
      }

      // Ownership check: only admin or the assigned PM can refresh progress
      if (
        requesterRole !== ROLES.ADMIN &&
        project.projectManagerId !== requesterId
      ) {
        throw new Error(
          "You can only refresh progress for projects you manage",
        );
      }

      return await project.updateProgress();
    } catch (error) {
      throw error;
    }
  }
}

export default ProjectService;
