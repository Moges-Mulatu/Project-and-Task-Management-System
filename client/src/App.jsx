import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Users from './pages/Users';
import Teams from './pages/Teams';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { ROLES } from './constants/roles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]}>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="tasks"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]}>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="tasks/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]}>
                  <TaskDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="teams"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]}>
                  <Teams />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
