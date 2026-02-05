import Team from '../models/team.model.js';
import TeamMember from '../models/teamMember.model.js';

/**
 * Team Service
 * Handles business logic for team management and member associations.
 */
class TeamService {
    /**
     * Create a new team
     * @param {Object} teamData - Team details
     * @returns {Promise<Team>} Created team instance
     */
    static async createTeam(teamData) {
        try {
            return await Team.create(teamData);
        } catch (error) {
            throw new Error(`Error creating team: ${error.message}`);
        }
    }

    /**
     * Get all active teams with optional filtering
     * @param {Object} filters - Filter options (department, teamLeadId)
     * @returns {Promise<Array>} List of team instances
     */
    static async getTeams(filters = {}) {
        try {
            return await Team.findAll(filters);
        } catch (error) {
            throw new Error(`Error fetching teams: ${error.message}`);
        }
    }

    /**
     * Get team by ID
     * @param {string} id - Team ID
     * @returns {Promise<Team>} Team instance
     */
    static async getTeamById(id) {
        try {
            const team = await Team.findById(id);
            if (!team) {
                throw new Error('Team not found');
            }
            return team;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update team details
     * @param {string} id - Team ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Team>} Updated team instance
     */
    static async updateTeam(id, updateData) {
        try {
            const team = await Team.findById(id);
            if (!team) {
                throw new Error('Team not found');
            }
            return await team.update(updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a team (soft delete)
     * @param {string} id - Team ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteTeam(id) {
        try {
            const team = await Team.findById(id);
            if (!team) {
                throw new Error('Team not found');
            }
            return await team.delete();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add a member to a team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID to add
     * @param {string} role - Member role within the team
     * @param {string} assignedBy - ID of the user assigning the member
     * @returns {Promise<TeamMember>} Created membership instance
     */
    static async addMember(teamId, userId, role = 'member', assignedBy = null) {
        try {
            // Check if membership already exists
            const existing = await TeamMember.findMembership(teamId, userId);
            if (existing) {
                throw new Error('User is already a member of this team');
            }

            return await TeamMember.create({
                teamId,
                userId,
                role,
                assignedBy
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Remove a member from a team
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID to remove
     * @returns {Promise<boolean>} Success status
     */
    static async removeMember(teamId, userId) {
        try {
            const membership = await TeamMember.findMembership(teamId, userId);
            if (!membership) {
                throw new Error('Membership record not found');
            }
            return await membership.leave();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all members for a specific team
     * @param {string} teamId - Team ID
     * @returns {Promise<Array>} List of team members
     */
    static async getTeamMembers(teamId) {
        try {
            return await TeamMember.findByTeam(teamId);
        } catch (error) {
            throw new Error(`Error fetching team members: ${error.message}`);
        }
    }
}

export default TeamService;
