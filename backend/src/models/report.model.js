const { v4: uuidv4 } = require('uuid');
const { getDBConnection } = require('../config/db.config');

class Report {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description || null;
    this.type = data.type;
    this.generatedBy = data.generatedBy;
    this.projectId = data.projectId || null;
    this.teamId = data.teamId || null;
    this.reportData = data.reportData || {};
    this.filters = data.filters || {};
    this.dateRange = data.dateRange || { startDate: null, endDate: null };
    this.format = data.format || 'json';
    this.status = data.status || 'generating';
    this.filePath = data.filePath || null;
    this.fileSize = data.fileSize || null;
    this.scheduledReport = data.scheduledReport || false;
    this.scheduleFrequency = data.scheduleFrequency || null;
    this.nextRunDate = data.nextRunDate || null;
    this.recipients = data.recipients || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(reportData) {
    const connection = getDBConnection();
    const report = new Report(reportData);
    
    const query = `
      INSERT INTO reports (
        id, title, description, type, generatedBy, projectId, teamId,
        reportData, filters, dateRange, format, status, filePath,
        fileSize, scheduledReport, scheduleFrequency, nextRunDate,
        recipients, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      report.id, report.title, report.description, report.type, report.generatedBy,
      report.projectId, report.teamId, JSON.stringify(report.reportData),
      JSON.stringify(report.filters), JSON.stringify(report.dateRange), report.format,
      report.status, report.filePath, report.fileSize, report.scheduledReport,
      report.scheduleFrequency, report.nextRunDate, JSON.stringify(report.recipients),
      report.createdAt, report.updatedAt
    ];

    try {
      await connection.execute(query, values);
      return report;
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  static async findById(id) {
    const connection = getDBConnection();
    const query = 'SELECT * FROM reports WHERE id = ?';
    
    try {
      const [rows] = await connection.execute(query, [id]);
      if (rows.length > 0) {
        const report = rows[0];
        report.reportData = JSON.parse(report.reportData || '{}');
        report.filters = JSON.parse(report.filters || '{}');
        report.dateRange = JSON.parse(report.dateRange || '{}');
        report.recipients = JSON.parse(report.recipients || '[]');
        return new Report(report);
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find report: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    const connection = getDBConnection();
    let query = 'SELECT * FROM reports';
    const values = [];

    if (options.generatedBy) {
      query += ' WHERE generatedBy = ?';
      values.push(options.generatedBy);
    }

    if (options.projectId) {
      query += values.length > 0 ? ' AND projectId = ?' : ' WHERE projectId = ?';
      values.push(options.projectId);
    }

    if (options.teamId) {
      query += values.length > 0 ? ' AND teamId = ?' : ' WHERE teamId = ?';
      values.push(options.teamId);
    }

    if (options.type) {
      query += values.length > 0 ? ' AND type = ?' : ' WHERE type = ?';
      values.push(options.type);
    }

    if (options.status) {
      query += values.length > 0 ? ' AND status = ?' : ' WHERE status = ?';
      values.push(options.status);
    }

    query += ' ORDER BY createdAt DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      values.push(options.limit);
    }

    try {
      const [rows] = await connection.execute(query, values);
      return rows.map(row => {
        row.reportData = JSON.parse(row.reportData || '{}');
        row.filters = JSON.parse(row.filters || '{}');
        row.dateRange = JSON.parse(row.dateRange || '{}');
        row.recipients = JSON.parse(row.recipients || '[]');
        return new Report(row);
      });
    } catch (error) {
      throw new Error(`Failed to find reports: ${error.message}`);
    }
  }

  async update(updateData) {
    const connection = getDBConnection();
    updateData.updatedAt = new Date();

    // Handle JSON fields
    if (updateData.reportData) {
      updateData.reportData = JSON.stringify(updateData.reportData);
    }
    if (updateData.filters) {
      updateData.filters = JSON.stringify(updateData.filters);
    }
    if (updateData.dateRange) {
      updateData.dateRange = JSON.stringify(updateData.dateRange);
    }
    if (updateData.recipients) {
      updateData.recipients = JSON.stringify(updateData.recipients);
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(this.id);

    const query = `UPDATE reports SET ${setClause} WHERE id = ?`;

    try {
      await connection.execute(query, values);
      Object.assign(this, updateData);
      
      // Parse JSON fields back to objects
      if (this.reportData) {
        this.reportData = JSON.parse(this.reportData);
      }
      if (this.filters) {
        this.filters = JSON.parse(this.filters);
      }
      if (this.dateRange) {
        this.dateRange = JSON.parse(this.dateRange);
      }
      if (this.recipients) {
        this.recipients = JSON.parse(this.recipients);
      }
      
      return this;
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  async delete() {
    const connection = getDBConnection();
    const query = 'DELETE FROM reports WHERE id = ?';
    
    try {
      await connection.execute(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }

  async markAsCompleted(filePath, fileSize) {
    return await this.update({
      status: 'completed',
      filePath,
      fileSize
    });
  }

  async markAsFailed(error) {
    return await this.update({
      status: 'failed',
      reportData: { error: error.message }
    });
  }

  static async findScheduledReports() {
    const connection = getDBConnection();
    const query = `
      SELECT * FROM reports 
      WHERE scheduledReport = 1 
      AND nextRunDate <= NOW() 
      AND status != 'generating'
      ORDER BY nextRunDate ASC
    `;
    
    try {
      const [rows] = await connection.execute(query);
      return rows.map(row => {
        row.reportData = JSON.parse(row.reportData || '{}');
        row.filters = JSON.parse(row.filters || '{}');
        row.dateRange = JSON.parse(row.dateRange || '{}');
        row.recipients = JSON.parse(row.recipients || '[]');
        return new Report(row);
      });
    } catch (error) {
      throw new Error(`Failed to find scheduled reports: ${error.message}`);
    }
  }

  async scheduleNextRun() {
    if (!this.scheduledReport || !this.scheduleFrequency) {
      return this;
    }

    const now = new Date();
    let nextRun = new Date(now);

    switch (this.scheduleFrequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
    }

    return await this.update({ nextRunDate: nextRun });
  }
}

module.exports = Report;