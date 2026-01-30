import { v4 as uuidv4 } from 'uuid';
import { getDBConnection } from '../config/db.config.js';

/**
 * Project Model
 * Manages project data, including tracking status, priority, and overall progress.
 */
class Project {
  /**
   * Create a new Project instance
   * @param {Object} data - Project data object
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description || null;
    this.teamId = data.teamId;
    this.projectManagerId = data.projectManagerId;
    this.status = data.status || 'planning';
    this.priority = data.priority || 'medium';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.estimatedEndDate = data.estimatedEndDate || null;
    this.budget = data.budget || null;
    this.progress = data.progress || 0;
    this.repositoryUrl = data.repositoryUrl || null;
    this.documentationUrl = data.documentationUrl || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Create a new project in the database
   * @param {Object} projectData - Data for the new project
   * @returns {Promise<Project>} The created Project instance
   */
  static async create(projectData) {
    const connection = getDBConnection();
    const project = new Project(projectData);

    const query = `
      INSERT INTO projects (
        id, name, description, teamId, projectManagerId, status, priority,
        startDate, endDate, estimatedEndDate, budget, progress, repositoryUrl,
        documentationUrl, isActive, tags, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      project.id, project.name, project.description, project.teamId, project.projectManagerId,
      project.status, project.priority, project.startDate, project.endDate, project.estimatedEndDate,
      project.budget, project.progress, project.repositoryUrl, project.documentationUrl,
      project.isActive, JSON.stringify(project.tags), project.createdAt, project.updatedAt
    ];

    try {
      await connection.execute(query, values);
      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Find a project by its ID
   * @param {string} id - The project ID
   * @returns {Promise<Project|null>} The project instance or null if not found
   */
  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM projects WHERE id = ? AND isActive = 1';

    try {
      const [rows] = await connection.execute(query, [id]);
      if (rows.length > 0) {
        const project = rows[0];
        project.tags = JSON.parse(project.tags || '[]');
        return new Project(project);
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find project: ${error.message}`);
    }
  }

  /**
   * Get all active projects with optional filtering
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Project[]>} Array of Project instances
   */
  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = 'SELECT * FROM projects WHERE isActive = 1';
    const values = [];

    if (options.teamId) {
      query += ' AND teamId = ?';
      values.push(options.teamId);
    }

    if (options.projectManagerId) {
      query += ' AND projectManagerId = ?';
      values.push(options.projectManagerId);
    }

    if (options.status) {
      query += ' AND status = ?';
      values.push(options.status);
    }

    if (options.priority) {
      query += ' AND priority = ?';
      values.push(options.priority);
    }

    query += ' ORDER BY createdAt DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      values.push(options.limit);
    }

    try {
      const [rows] = await connection.execute(query, values);
      return rows.map(row => {
        row.tags = JSON.parse(row.tags || '[]');
        return new Project(row);
      });
    } catch (error) {
      throw new Error(`Failed to find projects: ${error.message}`);
    }
  }

  /**
   * Update project details
   * @param {Object} updateData - Key-value pairs to update
   * @returns {Promise<Project>} The updated project instance
   */
  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE projects SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);

      // Parse JSON fields back to objects
      if (this.tags) {
        this.tags = JSON.parse(this.tags);
      }

      return this;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Soft delete a project (mark as inactive)
   * @returns {Promise<boolean>} Success status
   */
  async delete() {
    const connection = getDBConnection();
    const query = 'UPDATE projects SET isActive = 0, updatedAt = ? WHERE id = ?';

    try {
      await connection.execute(query, [new Date(), this.id]);
      this.isActive = false;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Refresh project progress based on the average progress of its tasks
   * @returns {Promise<Project>} This project instance with updated progress
   */
  async updateProgress() {
    const connection = getDBConnection();
    const query = `
      UPDATE projects p 
      SET p.progress = (
        SELECT AVG(t.progress) 
        FROM tasks t 
        WHERE t.projectId = p.id AND t.isActive = 1
      ),
      p.updatedAt = ?
      WHERE p.id = ?
    `;

    try {
      await connection.execute(query, [new Date(), this.id]);
      const [rows] = await connection.execute(
        'SELECT progress FROM projects WHERE id = ?',
        [this.id]
      );
      this.progress = rows[0].progress;
      return this;
    } catch (error) {
      throw new Error(`Failed to update project progress: ${error.message}`);
    }
  }
}


export default Project;
