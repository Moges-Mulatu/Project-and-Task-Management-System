import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import { ROLES } from './constants';

import Login from './pages/auth/Login';
import Dashboard from './pages/shared/Dashboard';
import Projects from './pages/shared/Projects';
import Tasks from './pages/shared/Tasks';
import Users from './pages/admin/Users';
import Teams from './pages/admin/Teams';
import Reports from './pages/shared/Reports';
import Profile from './pages/shared/Profile';
import Forbidden from './pages/Forbidden';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />

                            {/* Admin Only */}
                            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                                <Route path="/users" element={<Users />} />
                                <Route path="/teams" element={<Teams />} />
                            </Route>

                            {/* Admin & PM */}
                            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER]} />}>
                                <Route path="/projects" element={<Projects />} />
                                <Route path="/reports" element={<Reports />} />
                            </Route>

                            {/* All roles have task visibility (backend filters content) */}
                            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER]} />}>
                                <Route path="/tasks" element={<Tasks />} />
                            </Route>

                            <Route path="/profile" element={<Profile />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>

                    <Route path="/403" element={<Forbidden />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
