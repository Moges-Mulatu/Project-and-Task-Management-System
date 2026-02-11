-- =========================================
-- DATABASE: Project Management System (Comprehensive Sync)
-- =========================================

CREATE DATABASE IF NOT EXISTS project_management;
USE project_management;

-- Disable checks to allow clean structural rebuild
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'project_manager', 'team_member') DEFAULT 'team_member',
    department VARCHAR(100),
    position VARCHAR(100),
    avatar VARCHAR(255),
    phone VARCHAR(20),
    isActive TINYINT(1) DEFAULT 1,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- TEAMS TABLE
-- =========================================
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    teamLeadId VARCHAR(36),
    isActive TINYINT(1) DEFAULT 1,
    maxMembers INT DEFAULT 20,
    currentMemberCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_team_lead
        FOREIGN KEY (teamLeadId) REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================================
-- TEAM_MEMBERS TABLE
-- =========================================
CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY,
    teamId VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    role ENUM('lead', 'member') DEFAULT 'member',
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leftAt TIMESTAMP NULL,
    isActive TINYINT(1) DEFAULT 1,
    assignedBy VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tm_team
        FOREIGN KEY (teamId) REFERENCES teams(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tm_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_team_user UNIQUE (teamId, userId)
);

-- =========================================
-- PROJECTS TABLE
-- =========================================
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    teamId VARCHAR(36),
    projectManagerId VARCHAR(36),
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    startDate DATE,
    endDate DATE,
    estimatedEndDate DATE,
    budget DECIMAL(15, 2),
    progress INT DEFAULT 0,
    repositoryUrl VARCHAR(255),
    documentationUrl VARCHAR(255),
    isActive TINYINT(1) DEFAULT 1,
    tags TEXT, -- JSON String
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_team
        FOREIGN KEY (teamId) REFERENCES teams(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_project_pm
        FOREIGN KEY (projectManagerId) REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================================
-- TASKS TABLE
-- =========================================
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    projectId VARCHAR(36) NOT NULL,
    assignedTo VARCHAR(36),
    assignedBy VARCHAR(36),
    status ENUM('todo', 'in_progress', 'review', 'completed', 'blocked') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    type ENUM('task', 'bug', 'feature') DEFAULT 'feature',
    estimatedHours DECIMAL(5, 2),
    actualHours DECIMAL(5, 2) DEFAULT 0,
    startDate DATE,
    dueDate DATE,
    completedAt TIMESTAMP NULL,
    parentTaskId VARCHAR(36),
    storyPoints INT,
    tags TEXT, -- JSON String
    attachments TEXT, -- JSON String
    comments TEXT, -- JSON String
    progress INT DEFAULT 0,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_assignee
        FOREIGN KEY (assignedTo) REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_task_parent
        FOREIGN KEY (parentTaskId) REFERENCES tasks(id)
        ON DELETE SET NULL
);

-- =========================================
-- REPORTS TABLE
-- =========================================
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    type ENUM('project_summary', 'team_performance', 'task_bottlenecks') NOT NULL,
    generatedBy VARCHAR(36) NOT NULL,
    projectId VARCHAR(36),
    teamId VARCHAR(36),
    reportData LONGTEXT, -- JSON String
    filters TEXT, -- JSON String
    dateRange TEXT, -- JSON String
    format VARCHAR(10) DEFAULT 'json',
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    filePath VARCHAR(255),
    fileSize INT,
    scheduledReport TINYINT(1) DEFAULT 0,
    scheduleFrequency ENUM('daily', 'weekly', 'monthly', 'quarterly'),
    nextRunDate TIMESTAMP NULL,
    recipients TEXT, -- JSON String
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_report_team
        FOREIGN KEY (teamId) REFERENCES teams(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_report_user
        FOREIGN KEY (generatedBy) REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================
-- INDEXES for Performance
-- =========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_projectId ON tasks(projectId);
CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX idx_team_members_userId ON team_members(userId);
CREATE INDEX idx_team_members_teamId ON team_members(teamId);
