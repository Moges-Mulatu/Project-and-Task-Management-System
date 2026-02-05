-- Create task_assignments table for many-to-many relationships
CREATE TABLE IF NOT EXISTS task_assignments (
    id VARCHAR(36) PRIMARY KEY,
    taskId VARCHAR(36) NOT NULL,
    assigneeType ENUM('user', 'team') NOT NULL,
    assigneeId VARCHAR(36) NOT NULL,
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_assignment_task
        FOREIGN KEY (taskId) REFERENCES tasks(id)
        ON DELETE CASCADE,
        
    -- Unique constraint to prevent duplicate assignments
    UNIQUE KEY unique_task_assignee (taskId, assigneeType, assigneeId)
);

-- Add index for faster queries
CREATE INDEX idx_task_assignments_task ON task_assignments(taskId);
CREATE INDEX idx_task_assignments_assignee ON task_assignments(assigneeType, assigneeId);
