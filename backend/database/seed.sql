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
('u1-admin-001', 'System', 'Admin', 'admin@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'admin', 'Management', 'System Administrator', 1),
('u2-pm-001', 'Alex', 'Projector', 'pm@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'project_manager', 'Engineering', 'Project Lead', 1),
('u3-member-001', 'John', 'Coder', 'member@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Engineering', 'Software Engineer', 1),
('u4-backend-001', 'Maria', 'Backend', 'backend@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Engineering', 'Backend Developer', 1),
('u5-frontend-001', 'Lisa', 'Frontend', 'frontend@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Engineering', 'Frontend Developer', 1),
('u6-mobile-001', 'Tom', 'Mobile', 'mobile@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Engineering', 'Mobile Developer', 1),
('u7-ux-001', 'Sara', 'UX', 'ux@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Design', 'UI/UX Designer', 1),
('u8-pm-002', 'James', 'Manager', 'pm2@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'project_manager', 'Engineering', 'Project Lead', 1),
('u9-member-002', 'Ben', 'Tester', 'member2@debo.com', '$2b$10$tPx.U/xWd/B.Mh.iK8L3j.O30qGvOsg5uU6YyO6z.0P1uY.vOks.O', 'team_member', 'Engineering', 'QA Engineer', 1);

-- =========================================
-- TEAMS (as per spec: Team Structure)
-- =========================================
INSERT INTO teams (id, name, description, department, teamLeadId, maxMembers, currentMemberCount)
VALUES
('t1-backend-01', 'Backend Development Team', 'API, database, and server-side logic.', 'Engineering', 'u2-pm-001', 10, 2),
('t2-frontend-01', 'Frontend Web Development Team', 'React web interface and user experience.', 'Engineering', 'u2-pm-001', 10, 2),
('t3-mobile-01', 'Mobile Application Development Team', 'React Native mobile apps.', 'Engineering', 'u2-pm-001', 10, 2),
('t4-ux-01', 'UI/UX Design Team', 'Design, mockups, and user experience flows.', 'Design', 'u2-pm-001', 10, 2);

-- =========================================
-- TEAM_MEMBERS
-- =========================================
INSERT INTO team_members (id, teamId, userId, role, assignedBy)
VALUES
-- Backend team
('tm1-01', 't1-backend-01', 'u2-pm-001', 'lead', 'u1-admin-001'),
('tm1-02', 't1-backend-01', 'u4-backend-001', 'member', 'u2-pm-001'),

-- Frontend team
('tm2-01', 't2-frontend-01', 'u2-pm-001', 'lead', 'u1-admin-001'),
('tm2-02', 't2-frontend-01', 'u5-frontend-001', 'member', 'u2-pm-001'),

-- Mobile team
('tm3-01', 't3-mobile-01', 'u2-pm-001', 'lead', 'u1-admin-001'),
('tm3-02', 't3-mobile-01', 'u6-mobile-001', 'member', 'u2-pm-001'),

-- UX team
('tm4-01', 't4-ux-01', 'u2-pm-001', 'lead', 'u1-admin-001'),
('tm4-02', 't4-ux-01', 'u7-ux-001', 'member', 'u2-pm-001');

-- =========================================
-- PROJECTS
-- =========================================
INSERT INTO projects (id, name, description, teamId, projectManagerId, status, priority, progress, tags)
VALUES
('p1-mgmt-sys', 'Project Management System', 'Internship core project for Debo Engineering.', 't1-backend-01', 'u8-pm-002', 'active', 'high', 25, '["internship", "backend", "fullstack"]'),
('p2-web-ui', 'Web Dashboard', 'React-based dashboard for task and project tracking.', 't2-frontend-01', 'u2-pm-001', 'planning', 'medium', 0, '["frontend", "react", "dashboard"]'),
('p3-mobile-app', 'Mobile Task App', 'React Native mobile app for task management.', 't3-mobile-01', 'u2-pm-001', 'planning', 'medium', 0, '["mobile", "react-native", "app"]'),
('p4-design-system', 'UI/UX Design System', 'Design system and component library.', 't4-ux-01', 'u2-pm-001', 'planning', 'low', 0, '["design", "ui", "ux"]');

-- =========================================
-- TASKS
-- =========================================
INSERT INTO tasks (id, title, description, projectId, assignedTo, assignedBy, status, priority, type, storyPoints, progress, tags, attachments, comments)
VALUES
-- Backend project tasks
('ts1-db-001', 'Database Alignment', 'Update MySQL schema to match UUID/CamelCase models.', 'p1-mgmt-sys', 'u4-backend-001', 'u2-pm-001', 'in_progress', 'critical', 'feature', 5, 100, '["database", "migration"]', '[]', '[]'),
('ts1-api-001', 'Verify Auth Endpoints', 'Perform manual Postman testing for JWT flows.', 'p1-mgmt-sys', 'u4-backend-001', 'u2-pm-001', 'todo', 'high', 'task', 3, 0, '["testing", "auth"]', '[]', '[]'),

-- Frontend project tasks
('ts2-comp-001', 'Setup React Project', 'Initialize React app with Tailwind CSS.', 'p2-web-ui', 'u5-frontend-001', 'u2-pm-001', 'todo', 'high', 'feature', 5, 0, '["react", "setup"]', '[]', '[]'),
('ts2-dash-001', 'Build Dashboard Layout', 'Create main dashboard layout and navigation.', 'p2-web-ui', 'u5-frontend-001', 'u2-pm-001', 'todo', 'medium', 'feature', 3, 0, '["frontend", "dashboard"]', '[]', '[]'),

-- Mobile project tasks
('ts3-init-001', 'Initialize React Native', 'Set up React Native project structure.', 'p3-mobile-app', 'u6-mobile-001', 'u2-pm-001', 'todo', 'high', 'feature', 5, 0, '["mobile", "setup"]', '[]', '[]'),
('ts3-nav-001', 'Mobile Navigation', 'Implement tab navigation for the app.', 'p3-mobile-app', 'u6-mobile-001', 'u2-pm-001', 'todo', 'medium', 'feature', 3, 0, '["mobile", "navigation"]', '[]', '[]'),

-- UX project tasks
('ts4-research-001', 'User Research', 'Conduct user research for task management workflows.', 'p4-design-system', 'u7-ux-001', 'u2-pm-001', 'todo', 'medium', 'task', 2, 0, '["research", "ux"]', '[]', '[]'),
('ts4-mockup-001', 'Create Mockups', 'Design mockups for key screens.', 'p4-design-system', 'u7-ux-001', 'u2-pm-001', 'todo', 'medium', 'feature', 3, 0, '["design", "mockup"]', '[]', '[]');
