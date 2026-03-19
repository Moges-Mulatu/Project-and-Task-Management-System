# API Documentation

## Authentication
- POST /auth/login
- POST /auth/register

## Users
- GET /users
- POST /users
- GET /users/:id
- PATCH /users/:id
- DELETE /users/:id
- PATCH /users/me

## Teams
- GET /teams
- POST /teams
- GET /teams/:id
- PATCH /teams/:id
- DELETE /teams/:id
- GET /teams/:id/members
- POST /teams/:id/members
- DELETE /teams/:id/members/:userId

## Projects
- GET /projects
- POST /projects
- GET /projects/:id
- PATCH /projects/:id
- DELETE /projects/:id
- POST /projects/:id/refresh-progress

## Tasks
- GET /tasks
- POST /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- DELETE /tasks/:id

## Reports
- GET /reports
- POST /reports
- GET /reports/:id
- DELETE /reports/:id
- POST /reports/projects/:projectId/summary

## Health & System Routes
- GET /health
- GET /api/v1/system-stats