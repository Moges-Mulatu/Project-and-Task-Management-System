import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import { ROLES } from './constants/roles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
              path="projects"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]}>
                  <Projects />
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
              path="tasks/:id"
              element={
                <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]}>
                  <TaskDetails />
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
