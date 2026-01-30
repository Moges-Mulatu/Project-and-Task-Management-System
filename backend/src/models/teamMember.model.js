const { v4: uuidv4 } = require('uuid');
const { getDBConnection } = require('../config/db.config');

class TeamMember {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.teamId = data.teamId;
    this.userId = data.userId;
    this.role = data.role || 'member';
    this.joinedAt = data.joinedAt || new Date();
    this.leftAt = data.leftAt || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.assignedBy = data.assignedBy || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(memberData) {
    const connection = getDBConnection();
    const member = new TeamMember(memberData);
    
    const query = `
      INSERT INTO team_members (
        id, teamId, userId, role, joinedAt, leftAt, isActive, 
        assignedBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      member.id, member.teamId, member.userId, member.role, member.joinedAt,
      member.leftAt, member.isActive, member.assignedBy, member.createdAt, member.updatedAt
    ];

    try {
      await connection.execute(query, values);
      
      // Update team member count
      const Team = require('./team.model');
      const team = await Team.findById(member.teamId);
      if (team) {
        await team.updateMemberCount();
      }
      
      return member;
    } catch (error) {
      throw new Error(`Failed to create team member: ${error.message}`);
    }
  }

  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM team_members WHERE id = ? AND isActive = 1';
    
    try {
      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? new TeamMember(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find team member: ${error.message}`);
    }
  }

  static async findByTeam(teamId) {
    const connection = getDBConnection();
    const query = `
      SELECT tm.*, u.firstName, u.lastName, u.email 
      FROM team_members tm 
      JOIN users u ON tm.userId = u.id 
      WHERE tm.teamId = ? AND tm.isActive = 1 AND u.isActive = 1
      ORDER BY tm.joinedAt ASC
    `;
    
    try {
      const [rows] = await connection.execute(query, [teamId]);
      return rows.map(row => new TeamMember(row));
    } catch (error) {
      throw new Error(`Failed to find team members: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const connection = getDBConnection();
    const query = `
      SELECT tm.*, t.name as teamName, t.department 
      FROM team_members tm 
      JOIN teams t ON tm.teamId = t.id 
      WHERE tm.userId = ? AND tm.isActive = 1 AND t.isActive = 1
      ORDER BY tm.joinedAt DESC
    `;
    
    try {
      const [rows] = await connection.execute(query, [userId]);
      return rows.map(row => new TeamMember(row));
    } catch (error) {
      throw new Error(`Failed to find user team memberships: ${error.message}`);
    }
  }

  static async findMembership(teamId, userId) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM team_members WHERE teamId = ? AND userId = ? AND isActive = 1';
    
    try {
      const [rows] = await connection.execute(query, [teamId, userId]);
      return rows.length > 0 ? new TeamMember(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find team membership: ${error.message}`);
    }
  }

  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE team_members SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error(`Failed to update team member: ${error.message}`);
    }
  }

  async leave() {
    const connection = getDBConnection();
    const query = 'UPDATE team_members SET isActive = 0, leftAt = ?, updatedAt = ? WHERE id = ?';
    
    try {
      await connection.execute(query, [new Date(), new Date(), this.id]);
      this.isActive = false;
      this.leftAt = new Date();
      
      // Update team member count
      const Team = require('./team.model');
      const team = await Team.findById(this.teamId);
      if (team) {
        await team.updateMemberCount();
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to leave team: ${error.message}`);
    }
  }

  async delete() {
    return await this.leave();
  }
}

module.exports = TeamMember;