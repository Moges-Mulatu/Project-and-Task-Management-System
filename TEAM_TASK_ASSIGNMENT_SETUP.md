# Team Task Assignment Feature - Setup Instructions

## Overview

Added the ability to assign tasks to teams (not just individuals). The task creation form now validates that either an individual OR a team must be selected.

## Changes Made

### 1. Frontend (Mobile App)

#### CreateTaskScreen.js

- **Added team selection UI**: New "Assign to Team" section with horizontal scrollable team chips
- **Updated validation**: Schema now requires either `assignedTo` (individual) OR `teamId` (team)
- **Added OR divider**: Visual separator between individual and team assignment sections
- **Updated form state**: Added `teamId` to initialValues
- **Updated API call**: Now sends `teamId` field when creating tasks
- **Added styles**: New styles for `orDivider`, `orLine`, `orText`, `teamChip`, and `teamAvatar`

#### TeamDetailScreen.js

- **Updated task filtering**: Now shows tasks that are directly assigned to the team via `teamId` field
- Tasks assigned to the team will now be visible in the team detail page

#### Validation Schema

```javascript
.test(
  "assignee-required",
  "Please assign to either an individual or a team",
  function(values) {
    return !!(values.assignedTo || values.teamId);
  }
)
```

### 2. Backend

#### Database Schema (schema.sql)

- **Added `teamId` column**: `teamId VARCHAR(36)` added to tasks table after `assignedBy`

#### Task Validator (task.validator.js)

- **Added `teamId` field**: Made optional (not required) in validation rules
- Both `assignedTo` and `teamId` are now optional individually
- Frontend validation ensures at least one is selected

### 3. Database Migration Required

**IMPORTANT**: You must run the migration to add the `teamId` column to your database.

#### Option 1: Using MySQL Client

```sql
USE project_management;
ALTER TABLE tasks ADD COLUMN teamId VARCHAR(36) AFTER assignedBy;
CREATE INDEX idx_tasks_teamId ON tasks(teamId);
```

#### Option 2: Using the Migration File

Run the SQL file located at:

```
backend/database/add-teamId-migration.sql
```

Using MySQL command line:

```bash
mysql -u root -p0000 project_management < backend/database/add-teamId-migration.sql
```

Or using MySQL Workbench:

1. Open MySQL Workbench
2. Connect to your database
3. Open the file `backend/database/add-teamId-migration.sql`
4. Execute the script

## Testing Instructions

1. **Run the database migration** (see above)
2. **Restart the backend server** to ensure new schema is loaded
3. **Clear and restart the mobile app**:
   ```bash
   cd mobile
   npx expo start -c
   ```

### Test Cases

1. **Create Task with Individual Assignment**
   - Go to New Task screen
   - Fill in required fields
   - Select an individual user
   - DO NOT select a team
   - Submit → Should succeed

2. **Create Task with Team Assignment**
   - Go to New Task screen
   - Fill in required fields
   - Select a team
   - DO NOT select an individual
   - Submit → Should succeed

3. **Create Task without Assignment**
   - Go to New Task screen
   - Fill in required fields
   - Leave both individual and team as "Unassigned" / "No Team"
   - Submit → Should show error: "Please assign to either an individual or a team"

4. **View Team Tasks**
   - Create a task assigned to a team
   - Navigate to Teams > Select that team
   - Scroll to Tasks section
   - Verify the task appears in the team's task list

## API Payload Example

When creating a task assigned to a team:

```json
{
  "title": "Design new feature",
  "description": "Create mockups",
  "priority": "high",
  "type": "feature",
  "projectId": "abc-123",
  "teamId": "team-456",
  "dueDate": "2026-02-15",
  "estimatedHours": 8
}
```

When creating a task assigned to an individual:

```json
{
  "title": "Fix bug",
  "description": "Resolve login issue",
  "priority": "high",
  "type": "bug",
  "projectId": "abc-123",
  "assignedTo": "user-789",
  "dueDate": "2026-02-15",
  "estimatedHours": 4
}
```

## Files Modified

### Frontend

- `mobile/src/screens/CreateTaskScreen.js` - Added team selection UI and validation
- `mobile/src/screens/TeamDetailScreen.js` - Updated task filtering to include team-assigned tasks

### Backend

- `backend/database/schema.sql` - Added teamId column
- `backend/database/add-teamId-migration.sql` - Migration file (NEW)
- `backend/src/validators/task.validator.js` - Added teamId to validation rules

## Notes

- Tasks can be assigned to **either** an individual **or** a team, not both
- When a team is selected, the individual assignment is automatically cleared
- When an individual is selected, the team assignment is automatically cleared
- Validation only fires on submit (not while typing)
- Team-assigned tasks are visible in the team detail page
- The backend accepts both `assignedTo` and `teamId` as optional fields
