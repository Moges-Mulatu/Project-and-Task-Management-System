import Team from '../models/team.model.js';
import TeamMember from '../models/teamMember.model.js';
import { ROLES } from '../constants/roles.constants.js';

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
            // Validate teamLeadId exists if provided
            if (teamData.teamLeadId) {
                const User = (await import('../models/user.model.js')).default;
                const lead = await User.findById(teamData.teamLeadId);
                if (!lead) {
                    throw new Error('Team lead not found');
                }
            }

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
     * Get allowed update fields for teams
     * @returns {Array} List of allowed field names
     */
    static getAllowedUpdateFields() {
        return ['name', 'description', 'department', 'teamLeadId', 'maxMembers'];
    }

    /**
     * Update team details with ownership check
     * @param {string} id - Team ID
     * @param {Object} updateData - Data to update
     * @param {string} requesterId - ID of the user making the request
     * @param {string} requesterRole - Role of the user making the request
     * @returns {Promise<Team>} Updated team instance
     */
    static async updateTeam(id, updateData, requesterId, requesterRole) {
        try {
            const team = await Team.findById(id);
            if (!team) {
                throw new Error('Team not found');
            }

            // Ownership check for PMs - can only update teams they lead
            if (requesterRole === ROLES.PROJECT_MANAGER && team.teamLeadId !== requesterId) {
                throw new Error('You can only update teams you lead');
            }
            // Admin can update any team

            // Whitelist allowed fields
            const allowedFields = this.getAllowedUpdateFields();
            const filteredData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            // Prevent changing protected fields
            delete filteredData.id;
            delete filteredData.currentMemberCount;
            delete filteredData.createdAt;
            delete filteredData.isActive;

            return await team.update(filteredData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a team (soft delete) and automatically remove all active members
     * @param {string} id - Team ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteTeam(id) {
        try {
            const team = await Team.findById(id);
            if (!team) {
                throw new Error('Team not found');
            }

            // Remove all active members from the team first
            const activeMembers = await TeamMember.findByTeam(id);
            if (activeMembers && activeMembers.length > 0) {
                // Remove all members by marking them as inactive
                await Promise.all(
                    activeMembers.map(async (member) => {
                        await member.leave();
                    })
                );
            }

            // Now delete the team
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
            // Check if team exists and validate maxMembers
            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Team not found');
            }

            // Validate that the user exists and is active
            const User = (await import('../models/user.model.js')).default;
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.isActive) {
                throw new Error('Cannot add inactive user to team');
            }

            // Check if team has reached maximum member limit
            if (team.currentMemberCount >= team.maxMembers) {
                throw new Error('Team has reached maximum member limit');
            }

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
