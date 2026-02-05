-- Migration: Add teamId column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS teamId VARCHAR(36) AFTER assignedBy;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_teamId ON tasks(teamId);
