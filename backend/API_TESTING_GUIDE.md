# Backend API Testing Guide

This document provides comprehensive test cases for all backend API endpoints using Postman or any other API testing tool.

## Base URL
```
http://localhost:5003
```

## Authentication
All endpoints (except `/api/auth/register`, `/api/auth/login`, and `/health`) require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Test Cases

### 1. Authentication Endpoints

#### 1.1 Register User
**Method:** POST  
**URL:** `/api/auth/register`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "admin",
  "department": "Engineering",
  "position": "Senior Developer"
}
```
**Expected Response:** 201 Created with user data and token

#### 1.2 Login User
**Method:** POST  
**URL:** `/api/auth/login`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```
**Expected Response:** 200 OK with user data and JWT token

---

### 2. User Management Endpoints

#### 2.1 Get My Profile
**Method:** GET  
**URL:** `/api/users/me`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with user profile data

#### 2.2 Update My Profile
**Method:** PATCH  
**URL:** `/api/users/me`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe",
  "position": "Lead Developer"
}
```
**Expected Response:** 200 OK with updated user data

#### 2.3 Get All Users (Admin Only)
**Method:** GET  
**URL:** `/api/users`  
**Headers:** `Authorization: Bearer <admin-token>`  
**Expected Response:** 200 OK with array of all users

#### 2.4 Search Users
**Method:** GET  
**URL:** `/api/users/search?q=John`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with matching users

#### 2.5 Get User by ID (Admin Only)
**Method:** GET  
**URL:** `/api/users/{userId}`  
**Headers:** `Authorization: Bearer <admin-token>`  
**Expected Response:** 200 OK with specific user data

#### 2.6 Deactivate User (Admin Only)
**Method:** DELETE  
**URL:** `/api/users/{userId}`  
**Headers:** `Authorization: Bearer <admin-token>`  
**Expected Response:** 200 OK with success message

---

### 3. Team Management Endpoints

#### 3.1 Get All Teams
**Method:** GET  
**URL:** `/api/teams`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with array of teams

#### 3.2 Create Team (PM/Admin Only)
**Method:** POST  
**URL:** `/api/teams`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Development Team",
  "description": "Main development team for the project",
  "department": "Engineering",
  "teamLeadId": "{userId}",
  "maxMembers": 10
}
```
**Expected Response:** 201 Created with team data

#### 3.3 Get Team by ID
**Method:** GET  
**URL:** `/api/teams/{teamId}`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with team details

#### 3.4 Update Team (PM/Admin Only)
**Method:** PATCH  
**URL:** `/api/teams/{teamId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Updated Development Team",
  "description": "Updated description for the team"
}
```
**Expected Response:** 200 OK with updated team data

#### 3.5 Get Team Members
**Method:** GET  
**URL:** `/api/teams/{teamId}/members`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with team members list

#### 3.6 Add Team Member (PM/Admin Only)
**Method:** POST  
**URL:** `/api/teams/{teamId}/members`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "userId": "{userId}",
  "role": "member"
}
```
**Expected Response:** 201 Created with membership data

#### 3.7 Remove Team Member (PM/Admin Only)
**Method:** DELETE  
**URL:** `/api/teams/{teamId}/members/{userId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with success message

#### 3.8 Delete Team (Admin Only)
**Method:** DELETE  
**URL:** `/api/teams/{teamId}`  
**Headers:** `Authorization: Bearer <admin-token>`  
**Expected Response:** 200 OK with success message

---

### 4. Project Management Endpoints

#### 4.1 Get All Projects
**Method:** GET  
**URL:** `/api/projects`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with array of projects

#### 4.2 Create Project (PM/Admin Only)
**Method:** POST  
**URL:** `/api/projects`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Web Application Project",
  "description": "A comprehensive web application for task management",
  "teamId": "{teamId}",
  "projectManagerId": "{userId}",
  "status": "planning",
  "priority": "high",
  "startDate": "2024-01-01",
  "estimatedEndDate": "2024-06-30",
  "budget": 50000,
  "tags": ["web", "javascript", "nodejs"]
}
```
**Expected Response:** 201 Created with project data

#### 4.3 Get Project by ID
**Method:** GET  
**URL:** `/api/projects/{projectId}`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with project details

#### 4.4 Update Project (PM/Admin Only)
**Method:** PATCH  
**URL:** `/api/projects/{projectId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Updated Web Application Project",
  "status": "active",
  "progress": 25
}
```
**Expected Response:** 200 OK with updated project data

#### 4.5 Refresh Project Progress (PM/Admin Only)
**Method:** POST  
**URL:** `/api/projects/{projectId}/refresh-progress`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with updated progress

#### 4.6 Delete Project (PM/Admin Only)
**Method:** DELETE  
**URL:** `/api/projects/{projectId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with success message

---

### 5. Task Management Endpoints

#### 5.1 Get All Tasks
**Method:** GET  
**URL:** `/api/tasks`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with array of tasks

#### 5.2 Create Task
**Method:** POST  
**URL:** `/api/tasks`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "title": "Implement User Authentication",
  "description": "Create login and registration functionality",
  "projectId": "{projectId}",
  "assignedTo": "{userId}",
  "assignedBy": "{userId}",
  "status": "todo",
  "priority": "high",
  "type": "feature",
  "estimatedHours": 8,
  "dueDate": "2024-02-15",
  "storyPoints": 5,
  "tags": ["authentication", "security"]
}
```
**Expected Response:** 201 Created with task data

#### 5.3 Get Task by ID
**Method:** GET  
**URL:** `/api/tasks/{taskId}`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with task details

#### 5.4 Update Task
**Method:** PATCH  
**URL:** `/api/tasks/{taskId}`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "title": "Updated: Implement User Authentication",
  "status": "in_progress",
  "progress": 50,
  "actualHours": 4
}
```
**Expected Response:** 200 OK with updated task data

#### 5.5 Add Task Comment
**Method:** POST  
**URL:** `/api/tasks/{taskId}/comments`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "text": "Working on the authentication module. Making good progress!",
  "userId": "{userId}"
}
```
**Expected Response:** 201 Created with comment data

#### 5.6 Add Task Attachment
**Method:** POST  
**URL:** `/api/tasks/{taskId}/attachments`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "filename": "authentication-design.pdf",
  "url": "https://example.com/files/authentication-design.pdf",
  "size": 1024000,
  "uploadedBy": "{userId}"
}
```
**Expected Response:** 201 Created with attachment data

#### 5.7 Delete Task
**Method:** DELETE  
**URL:** `/api/tasks/{taskId}`  
**Headers:** `Authorization: Bearer <token>`  
**Expected Response:** 200 OK with success message

---

### 6. Report Management Endpoints

#### 6.1 Get All Reports (PM/Admin Only)
**Method:** GET  
**URL:** `/api/reports`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with array of reports

#### 6.2 Create Report (PM/Admin Only)
**Method:** POST  
**URL:** `/api/reports`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "title": "Project Progress Report",
  "description": "Monthly progress report for all active projects",
  "type": "project_summary",
  "projectId": "{projectId}",
  "teamId": "{teamId}",
  "format": "pdf",
  "filters": {
    "status": ["active", "completed"],
    "priority": ["high", "medium"]
  },
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "recipients": ["john.doe@example.com"]
}
```
**Expected Response:** 201 Created with report data

#### 6.3 Get Report by ID (PM/Admin Only)
**Method:** GET  
**URL:** `/api/reports/{reportId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with report details

#### 6.4 Generate Project Summary Report (PM/Admin Only)
**Method:** POST  
**URL:** `/api/reports/projects/{projectId}/summary`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "format": "pdf",
  "includeTasks": true,
  "includeTeamMembers": true,
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```
**Expected Response:** 200 OK with generated report

#### 6.5 Delete Report (PM/Admin Only)
**Method:** DELETE  
**URL:** `/api/reports/{reportId}`  
**Headers:** `Authorization: Bearer <pm-or-admin-token>`  
**Expected Response:** 200 OK with success message

---

### 7. Health Check

#### 7.1 Health Check
**Method:** GET  
**URL:** `/health`  
**Headers:** None  
**Expected Response:** 200 OK with server status

---

## 🧪 Testing Workflow

### Step 1: Setup
1. Ensure the backend server is running on `http://localhost:3003`
2. Test the health check endpoint to verify server is up

### Step 2: Authentication
1. Register a new user with admin role
2. Login to get the JWT token
3. Save the token for subsequent requests

### Step 3: Create Test Data
1. Create a team
2. Create a project
3. Create tasks
4. Generate reports

### Step 4: Test All Endpoints
1. Test GET endpoints to retrieve data
2. Test POST endpoints to create new resources
3. Test PATCH endpoints to update existing resources
4. Test DELETE endpoints to remove resources

### Step 5: Error Testing
1. Test endpoints without authentication (should return 401)
2. Test endpoints with wrong roles (should return 403)
3. Test with invalid data (should return 400/422)
4. Test with non-existent IDs (should return 404)

---

## 📝 Expected Response Formats

### Success Responses
- **200 OK**: Successful GET, PATCH, DELETE operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE with no content

### Error Responses
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side errors

---

## 🔧 Postman Setup

### Environment Variables
Create an environment in Postman with these variables:
- `baseUrl`: `http://localhost:3003`
- `authToken`: (will be set after login)
- `userId`: (will be set after login)
- `teamId`: (will be set after creating team)
- `projectId`: (will be set after creating project)
- `taskId`: (will be set after creating task)

### Collection Setup
1. Import all the test cases above into a Postman collection
2. Set the collection to use the environment variables
3. Configure authentication to use Bearer token with `{{authToken}}`
4. Set up test scripts to automatically extract IDs from responses

---

## 🚨 Important Notes

1. **Authentication**: Most endpoints require a valid JWT token
2. **Role-Based Access**: Some endpoints are restricted to specific roles (admin, project_manager)
3. **Data Validation**: All POST/PATCH requests validate input data
4. **Error Handling**: Always check response codes and error messages
5. **Database State**: Tests may affect database state - use test data
6. **Dependencies**: Some endpoints depend on others (e.g., tasks need projects)

---

## 📊 Test Coverage Checklist

- [ ] Authentication (Register, Login)
- [ ] User Management (CRUD operations)
- [ ] Team Management (Create, Update, Delete, Members)
- [ ] Project Management (Create, Update, Delete, Progress)
- [ ] Task Management (Create, Update, Delete, Comments, Attachments)
- [ ] Report Management (Create, Generate, Delete)
- [ ] Health Check
- [ ] Error Handling (401, 403, 404, 422)
- [ ] Role-Based Access Control
- [ ] Data Validation

This comprehensive test suite covers all major functionality of the Project & Task Management System backend API.
