const { getDBConnection } = require('../config/db.config');

const User = require('./user.model');
const Team = require('./team.model');
const TeamMember = require('./teamMember.model');
const Project = require('./project.model');
const Task = require('./task.model');
const Report = require('./report.model');

// Helper function to create tables if they don't exist
const createTables = async () => {
  const connection = getDBConnection();
  
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'developer', 'tester', 'viewer') NOT NULL DEFAULT 'developer',
        department VARCHAR(100),
        position VARCHAR(100),
        avatar VARCHAR(255),
        phone VARCHAR(20),
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (isActive)
      )
    `);

    // Create teams table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        department VARCHAR(100),
        teamLeadId VARCHAR(36),
        isActive BOOLEAN DEFAULT TRUE,
        maxMembers INT DEFAULT 20,
        currentMemberCount INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teamLead (teamLeadId),
        INDEX idx_active (isActive),
        UNIQUE KEY unique_team_name (name, department)
      )
    `);

    // Create team_members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(36) PRIMARY KEY,
        teamId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        role ENUM('lead', 'senior_member', 'member', 'junior_member') NOT NULL DEFAULT 'member',
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        leftAt DATETIME,
        isActive BOOLEAN DEFAULT TRUE,
        assignedBy VARCHAR(36),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teamId (teamId),
        INDEX idx_userId (userId),
        INDEX idx_active (isActive),
        UNIQUE KEY unique_team_member (teamId, userId)
      )
    `);

    // Create projects table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        teamId VARCHAR(36) NOT NULL,
        projectManagerId VARCHAR(36) NOT NULL,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
        startDate DATE,
        endDate DATE,
        estimatedEndDate DATE,
        budget DECIMAL(12,2),
        progress INT DEFAULT 0,
        repositoryUrl VARCHAR(500),
        documentationUrl VARCHAR(500),
        isActive BOOLEAN DEFAULT TRUE,
        tags JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teamId (teamId),
        INDEX idx_projectManager (projectManagerId),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      )
    `);

    // Create tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        projectId VARCHAR(36) NOT NULL,
        assignedTo VARCHAR(36),
        assignedBy VARCHAR(36) NOT NULL,
        status ENUM('todo', 'in_progress', 'in_review', 'completed', 'cancelled') NOT NULL DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
        type ENUM('feature', 'bug', 'improvement', 'documentation', 'testing', 'research') NOT NULL DEFAULT 'feature',
        estimatedHours DECIMAL(5,2),
        actualHours DECIMAL(5,2) DEFAULT 0,
        startDate DATE,
        dueDate DATE,
        completedAt DATETIME,
        parentTaskId VARCHAR(36),
        storyPoints INT,
        tags JSON,
        attachments JSON,
        comments JSON,
        progress INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_projectId (projectId),
        INDEX idx_assignedTo (assignedTo),
        INDEX idx_assignedBy (assignedBy),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_parentTask (parentTaskId),
        INDEX idx_type (type)
      )
    `);

    // Create reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type ENUM('project_summary', 'team_performance', 'task_completion', 'time_tracking', 'budget_analysis', 'custom') NOT NULL,
        generatedBy VARCHAR(36) NOT NULL,
        projectId VARCHAR(36),
        teamId VARCHAR(36),
        reportData JSON NOT NULL,
        filters JSON,
        dateRange JSON,
        format ENUM('json', 'pdf', 'excel', 'csv') NOT NULL DEFAULT 'json',
        status ENUM('generating', 'completed', 'failed') NOT NULL DEFAULT 'generating',
        filePath VARCHAR(500),
        fileSize INT,
        scheduledReport BOOLEAN DEFAULT FALSE,
        scheduleFrequency ENUM('daily', 'weekly', 'monthly', 'quarterly'),
        nextRunDate DATETIME,
        recipients JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_generatedBy (generatedBy),
        INDEX idx_projectId (projectId),
        INDEX idx_teamId (teamId),
        INDEX idx_status (status),
        INDEX idx_scheduled (scheduledReport, nextRunDate)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await createTables();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  User,
  Team,
  TeamMember,
  Project,
  Task,
  Report,
  initializeDatabase,
  createTables
};
