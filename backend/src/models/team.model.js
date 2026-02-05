import { v4 as uuidv4 } from 'uuid';
import { getDBConnection } from '../config/db.config.js';

/**
 * Team Model
 * Manages team structures, departments, and member tracking.
 */
class Team {
  /**
   * Create a new Team instance
   * @param {Object} data - Team data object
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description || null;
    this.department = data.department || null;
    this.teamLeadId = data.teamLeadId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.maxMembers = data.maxMembers || 20;
    this.currentMemberCount = data.currentMemberCount || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Create a new team in the database
   * @param {Object} teamData - Data for the new team
   * @returns {Promise<Team>} The created Team instance
   */
  static async create(teamData) {
    const connection = getDBConnection();
    const team = new Team(teamData);

    const query = `
      INSERT INTO teams (
        id, name, description, department, teamLeadId, isActive, 
        maxMembers, currentMemberCount, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      team.id, team.name, team.description, team.department, team.teamLeadId,
      team.isActive, team.maxMembers, team.currentMemberCount,
      team.createdAt, team.updatedAt
    ];

    try {
      await connection.execute(query, values);
      return team;
    } catch (error) {
      throw new Error(`Failed to create team: ${error.message}`);
    }
  }

  /**
   * Find a team by its ID
   * @param {string} id - The team ID
   * @returns {Promise<Team|null>} The team instance or null if not found
   */
  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM teams WHERE id = ? AND isActive = 1';

    try {
      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? new Team(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find team: ${error.message}`);
    }
  }

  /**
   * Get all active teams with optional filtering
   * @param {Object} options - Filter options (department, teamLeadId, limit)
   * @returns {Promise<Team[]>} Array of Team instances
   */
  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = 'SELECT * FROM teams WHERE isActive = 1';
    const values = [];

    if (options.department) {
      query += ' AND department = ?';
      values.push(options.department);
    }

    if (options.teamLeadId) {
      query += ' AND teamLeadId = ?';
      values.push(options.teamLeadId);
    }

    query += ' ORDER BY createdAt DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      values.push(options.limit);
    }

    try {
      const [rows] = await connection.execute(query, values);
      return rows.map(row => new Team(row));
    } catch (error) {
      throw new Error(`Failed to find teams: ${error.message}`);
    }
  }

  /**
   * Update team details
   * @param {Object} updateData - Key-value pairs to update
   * @returns {Promise<Team>} The updated team instance
   */
  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE teams SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error(`Failed to update team: ${error.message}`);
    }
  }

  /**
   * Soft delete a team (mark as inactive)
   * @returns {Promise<boolean>} Success status
   */
  async delete() {
    const connection = getDBConnection();
    const query = 'UPDATE teams SET isActive = 0, updatedAt = ? WHERE id = ?';

    try {
      await connection.execute(query, [new Date(), this.id]);
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  }

  /**
   * Refresh the current member count for this team
   * @returns {Promise<Team>} This team instance with updated count
   */
  async updateMemberCount() {
    const connection = getDBConnection();
    const query = `
      UPDATE teams t 
      SET t.currentMemberCount = (
        SELECT COUNT(*) 
        FROM team_members tm 
        WHERE tm.teamId = t.id AND tm.isActive = 1
      ),
      t.updatedAt = ?
      WHERE t.id = ?
    `;

    try {
      await connection.execute(query, [new Date(), this.id]);
      const [rows] = await connection.execute(
        'SELECT currentMemberCount FROM teams WHERE id = ?',
        [this.id]
      );
      this.currentMemberCount = rows[0].currentMemberCount;
      return this;
    } catch (error) {
      throw new Error(`Failed to update member count: ${error.message}`);
    }
  }
}


export default Team;
