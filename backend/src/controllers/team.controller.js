import TeamService from '../services/team.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

/**
 * Team Controller
 * Handles HTTP requests related to team management and membership.
 */
class TeamController {
    /**
     * Create a new team
     */
    static async create(req, res) {
        try {
            const team = await TeamService.createTeam(req.body);
            return sendSuccess(res, 'Team created successfully', team, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all teams
     */
    static async getAll(req, res) {
        try {
            const filters = {
                department: req.query.department,
                teamLeadId: req.query.teamLeadId
            };
            const teams = await TeamService.getTeams(filters);
            return sendSuccess(res, 'Teams retrieved successfully', teams);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    /**
     * Get team by ID
     */
    static async getById(req, res) {
        try {
            const team = await TeamService.getTeamById(req.params.id);
            return sendSuccess(res, 'Team retrieved successfully', team);
        } catch (error) {
            return sendError(res, error.message, 404);
        }
    }

    /**
     * Update team details
     */
    static async update(req, res) {
        try {
            const team = await TeamService.updateTeam(req.params.id, req.body, req.user.id, req.user.role);
            return sendSuccess(res, 'Team updated successfully', team);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Delete a team
     */
    static async delete(req, res) {
        try {
            await TeamService.deleteTeam(req.params.id);
            return sendSuccess(res, 'Team deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Add a member to a team
     */
    static async addMember(req, res) {
        try {
            const { userId, role } = req.body;
            const member = await TeamService.addMember(req.params.id, userId, role, req.user.id);
            return sendSuccess(res, 'Member added to team', member, 201);
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Remove a member from a team
     */
    static async removeMember(req, res) {
        try {
            const { userId } = req.params;
            await TeamService.removeMember(req.params.id, userId);
            return sendSuccess(res, 'Member removed from team');
        } catch (error) {
            return sendError(res, error.message, 400);
        }
    }

    /**
     * Get all members of a team
     */
    static async getMembers(req, res) {
        try {
            const members = await TeamService.getTeamMembers(req.params.id);
            return sendSuccess(res, 'Team members retrieved successfully', members);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

export default TeamController;
