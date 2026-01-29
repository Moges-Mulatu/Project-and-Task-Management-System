USE project_management;

-- =========================================
-- USERS (Admin + Project Managers + Team Members)
-- =========================================
INSERT INTO users (full_name, email, password, role, phone_number, status)
VALUES
('Admin User', 'admin@debo.com', '$2a$10$hashedpasswordhere', 'ADMIN', '+251900000001', 'ACTIVE'),
('Project Manager 1', 'pm1@debo.com', '$2a$10$hashedpasswordhere', 'PROJECT_MANAGER', '+251900000002', 'ACTIVE'),
('Project Manager 2', 'pm2@debo.com', '$2a$10$hashedpasswordhere', 'PROJECT_MANAGER', '+251900000003', 'ACTIVE'),
('Team Member 1', 'tm1@debo.com', '$2a$10$hashedpasswordhere', 'TEAM_MEMBER', '+251900000004', 'ACTIVE'),
('Team Member 2', 'tm2@debo.com', '$2a$10$hashedpasswordhere', 'TEAM_MEMBER', '+251900000005', 'ACTIVE'),
('Team Member 3', 'tm3@debo.com', '$2a$10$hashedpasswordhere', 'TEAM_MEMBER', '+251900000006', 'ACTIVE');

-- =========================================
-- TEAMS
-- =========================================
INSERT INTO teams (team_name, description, created_by)
VALUES
('Backend Team', 'Handles all backend APIs and database design', 1),
('Frontend Team', 'Responsible for web UI and dashboards', 1),
('Mobile Team', 'Builds cross-platform mobile application', 1);

-- =========================================
-- TEAM_MEMBERS
-- =========================================
INSERT INTO team_members (team_id, user_id, member_role)
VALUES
(1, 2, 'Lead'), -- PM1 in Backend Team
(1, 4, 'Member'), -- TM1 in Backend Team
(1, 5, 'Member'), -- TM2 in Backend Team
(2, 3, 'Lead'), -- PM2 in Frontend Team
(2, 6, 'Member'); -- TM3 in Frontend Team

-- =========================================
-- PROJECTS
-- =========================================
INSERT INTO projects (project_name, description, start_date, end_date, status, team_id, created_by)
VALUES
('Project & Task Management System', 'Two-week internship project', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'NOT_STARTED', 1, 2),
('Frontend Dashboard Revamp', 'Improve UI of web dashboard', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'NOT_STARTED', 2, 3);

-- =========================================
-- TASKS
-- =========================================
INSERT INTO tasks (task_title, description, project_id, assigned_to, deadline, status, progress_percentage, created_by)
VALUES
('Design Database Schema', 'Create all tables and relationships', 1, 4, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'NOT_STARTED', 0, 2),
('Setup Backend Server', 'Initialize Express server and routes', 1, 5, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'NOT_STARTED', 0, 2),
('Implement Authentication', 'JWT login, register, and role-based access', 1, 4, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'NOT_STARTED', 0, 2),
('Create Web UI Layout', 'Build dashboard and task pages', 2, 6, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'NOT_STARTED', 0, 3),
('Integrate APIs', 'Connect frontend with backend endpoints', 2, 6, DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'NOT_STARTED', 0, 3);

-- =========================================
-- REPORTS (optional, if stored)
-- =========================================
INSERT INTO reports (report_type, generated_by, filters_applied)
VALUES
('PROJECT', 2, '{"project_id":1, "team_id":1}'),
('TASK', 3, '{"project_id":2}');
