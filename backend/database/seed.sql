USE project_management;

-- Disable checks for clean data population
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM team_members;
DELETE FROM tasks;
DELETE FROM reports;
DELETE FROM projects;
DELETE FROM teams;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- USERS (Admin + PM + Member)
-- Passwords are hashed 'password123'
-- =========================================
INSERT INTO users (id, firstName, lastName, email, password, role, department, position, isActive)
VALUES
('u1-admin-001', 'System', 'Admin', 'admin@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.iG8pMv0vK0vK0vK0vK0vK0vK0vK0vK', 'admin', 'Management', 'System Administrator', 1),
('u2-pm-001', 'Alex', 'Projector', 'pm@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.iG8pMv0vK0vK0vK0vK0vK0vK0vK0vK', 'project_manager', 'Engineering', 'Project Lead', 1),
('u3-member-001', 'John', 'Coder', 'member@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.iG8pMv0vK0vK0vK0vK0vK0vK0vK0vK', 'team_member', 'Engineering', 'Software Engineer', 1);

-- =========================================
-- TEAMS
-- =========================================
INSERT INTO teams (id, name, description, department, teamLeadId, maxMembers, currentMemberCount)
VALUES
('t1-backend-01', 'Backend Devs', 'Developing core API and DB services.', 'Engineering', 'u2-pm-001', 10, 2),
('t2-frontend-01', 'Frontend Devs', 'Building the React Management Board.', 'Engineering', 'u2-pm-001', 10, 1);

-- =========================================
-- TEAM_MEMBERS
-- =========================================
INSERT INTO team_members (id, teamId, userId, role, assignedBy)
VALUES
('tm1-01', 't1-backend-01', 'u2-pm-001', 'lead', 'u1-admin-001'),
('tm1-02', 't1-backend-01', 'u3-member-001', 'member', 'u2-pm-001'),
('tm2-01', 't2-frontend-01', 'u2-pm-001', 'lead', 'u1-admin-001');

-- =========================================
-- PROJECTS
-- =========================================
INSERT INTO projects (id, name, description, teamId, projectManagerId, status, priority, progress, tags)
VALUES
('p1-mgmt-sys', 'Project Management System', 'Internship core project for Debo Engineering.', 't1-backend-01', 'u2-pm-001', 'active', 'high', 25, '["internship", "backend", "fullstack"]');

-- =========================================
-- TASKS
-- =========================================
INSERT INTO tasks (id, title, description, projectId, assignedTo, assignedBy, status, priority, type, storyPoints, progress, tags, attachments, comments)
VALUES
('ts1-db-001', 'Database Alignment', 'Update MySQL schema to match UUID/CamelCase models.', 'p1-mgmt-sys', 'u3-member-001', 'u2-pm-001', 'in_progress', 'critical', 'feature', 5, 100, '["database", "migration"]', '[]', '[]'),
('ts1-api-001', 'Verify Auth Endpoints', 'Perform manual Postman testing for JWT flows.', 'p1-mgmt-sys', 'u3-member-001', 'u2-pm-001', 'todo', 'high', 'task', 3, 0, '["testing", "auth"]', '[]', '[]');
