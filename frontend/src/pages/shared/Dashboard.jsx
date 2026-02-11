import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import AdminDashboard from '../admin/AdminDashboard';
import PMDashboard from '../pm/PMDashboard';
import MemberDashboard from '../member/MemberDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case ROLES.ADMIN:
            return <AdminDashboard />;
        case ROLES.PROJECT_MANAGER:
            return <PMDashboard />;
        case ROLES.TEAM_MEMBER:
            return <MemberDashboard />;
        default:
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <h2 className="text-xl font-bold text-text-primary">Welcome</h2>
                    <p className="text-text-secondary mt-2">Checking permissions...</p>
                </div>
            );
    }
};

export default Dashboard;
