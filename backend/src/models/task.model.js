import { v4 as uuidv4 } from 'uuid';
import { getDBConnection } from '../config/db.config.js';
import Project from './project.model.js';

class Task {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description || null;
    this.projectId = data.projectId;
    this.assignedTo = data.assignedTo || null;
    this.assignedBy = data.assignedBy;
    this.status = data.status || 'todo';
    this.priority = data.priority || 'medium';
    this.type = data.type || 'feature';
    this.estimatedHours = data.estimatedHours || null;
    this.actualHours = data.actualHours || 0;
    this.startDate = data.startDate || null;
    this.dueDate = data.dueDate || null;
    this.completedAt = data.completedAt || null;
    this.parentTaskId = data.parentTaskId || null;
    this.storyPoints = data.storyPoints || null;
    this.tags = data.tags || [];
    this.attachments = data.attachments || [];
    this.comments = data.comments || [];
    this.progress = data.progress || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(taskData) {
    const connection = getDBConnection();
    const task = new Task(taskData);

    const query = `
      INSERT INTO tasks (
        id, title, description, projectId, assignedTo, assignedBy, status,
        priority, type, estimatedHours, actualHours, startDate, dueDate,
        completedAt, parentTaskId, storyPoints, tags, attachments, comments,
        progress, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      task.id, task.title, task.description, task.projectId, task.assignedTo,
      task.assignedBy, task.status, task.priority, task.type, task.estimatedHours,
      task.actualHours, task.startDate, task.dueDate, task.completedAt, task.parentTaskId,
      task.storyPoints, JSON.stringify(task.tags), JSON.stringify(task.attachments),
      JSON.stringify(task.comments), task.progress, task.createdAt, task.updatedAt
    ];

    try {
      await connection.execute(query, values);

      // Update project progress
      const project = await Project.findById(task.projectId);
      if (project) {
        await project.updateProgress();
      }

      return task;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM tasks WHERE id = ? AND isActive = 1';

    try {
      const [rows] = await connection.execute(query, [id]);
      if (rows.length > 0) {
        const task = rows[0];
        task.tags = JSON.parse(task.tags || '[]');
        task.attachments = JSON.parse(task.attachments || '[]');
        task.comments = JSON.parse(task.comments || '[]');
        return new Task(task);
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find task: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = 'SELECT * FROM tasks WHERE isActive = 1';
    const values = [];

    if (options.projectId) {
      query += ' AND projectId = ?';
      values.push(options.projectId);
    }

    if (options.assignedTo) {
      query += ' AND assignedTo = ?';
      values.push(options.assignedTo);
    }

    if (options.status) {
      query += ' AND status = ?';
      values.push(options.status);
    }

    if (options.priority) {
      query += ' AND priority = ?';
      values.push(options.priority);
    }

    if (options.type) {
      query += ' AND type = ?';
      values.push(options.type);
    }

    if (options.parentTaskId) {
      query += ' AND parentTaskId = ?';
      values.push(options.parentTaskId);
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
        row.attachments = JSON.parse(row.attachments || '[]');
        row.comments = JSON.parse(row.comments || '[]');
        return new Task(row);
      });
    } catch (error) {
      throw new Error(`Failed to find tasks: ${error.message}`);
    }
  }

  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    // Handle JSON fields
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }
    if (updateData.comments) {
      updateData.comments = JSON.stringify(updateData.comments);
    }

    // Set completedAt when status is completed
    if (updateData.status === 'completed' && this.status !== 'completed') {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);

      // Parse JSON fields back to objects
      if (this.tags) {
        this.tags = JSON.parse(this.tags);
      }
      if (this.attachments) {
        this.attachments = JSON.parse(this.attachments);
      }
      if (this.comments) {
        this.comments = JSON.parse(this.comments);
      }

      // Update project progress
      const project = await Project.findById(this.projectId);
      if (project) {
        await project.updateProgress();
      }

      return this;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async delete() {
    const connection = getDBConnection();
    const query = 'UPDATE tasks SET isActive = 0, updatedAt = ? WHERE id = ?';

    try {
      await connection.execute(query, [new Date(), this.id]);
      this.isActive = false;

      // Update project progress
      const project = await Project.findById(this.projectId);
      if (project) {
        await project.updateProgress();
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async addComment(comment) {
    if (!this.comments) {
      this.comments = [];
    }
    this.comments.push({
      id: uuidv4(),
      text: comment.text,
      userId: comment.userId,
      createdAt: new Date()
    });

    return await this.update({ comments: this.comments });
  }

  async addAttachment(attachment) {
    if (!this.attachments) {
      this.attachments = [];
    }
    this.attachments.push({
      id: uuidv4(),
      filename: attachment.filename,
      url: attachment.url,
      size: attachment.size,
      uploadedBy: attachment.uploadedBy,
      uploadedAt: new Date()
    });

    return await this.update({ attachments: this.attachments });
  }
}

export default Task;
