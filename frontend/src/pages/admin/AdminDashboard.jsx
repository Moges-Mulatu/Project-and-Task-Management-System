import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import CreateUserModal from '../../components/modals/CreateUserModal';
import CreateTeamModal from '../../components/modals/CreateTeamModal';
import { 
    Users, Network, Briefcase, 
    UserPlus, PlusCircle, FileText, BarChart3,
    ArrowRight, Crown, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => {
    const colorClasses = {
        'brand-green': 'bg-brand-green/10 text-brand-green border-brand-green/20',
        'info': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'brand-blue': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
        'success': 'bg-green-500/10 text-green-400 border-green-500/20'
    };

    return (
        <Card 
            className="group cursor-pointer overflow-hidden relative"
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-brand-green" />
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

const QuickActionCard = ({ icon: Icon, label, description, onClick, color }) => {
    const colorClasses = {
        'brand-green': 'from-brand-green/20 to-brand-green/5 border-brand-green/30 hover:border-brand-green',
        'info': 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-400',
        'brand-blue': 'from-brand-blue/20 to-brand-blue/5 border-brand-blue/30 hover:border-brand-blue',
        'success': 'from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-400'
    };

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden p-4 rounded-xl border bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left`}
        >
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-text-primary" />
                </div>
                <h4 className="text-base font-semibold text-text-primary mb-1">{label}</h4>
                <p className="text-xs text-text-muted">{description}</p>
            </div>
        </button>
    );
};

const WelcomeBanner = ({ user }) => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-green/20 via-brand-blue/20 to-brand-green/20 border border-brand-green/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-brand-green" />
                    <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Administrator</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">
                    Welcome back, {user?.firstName || 'Admin'}
                </h1>
                <p className="text-sm text-text-secondary">
                    Manage your organization's users, teams, and projects from one central hub.
                </p>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, teams: 0, projects: 0 });
    const [loading, setLoading] = useState(true);
    
    const [showUserModal, setShowUserModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [u, t, p] = await Promise.all([
                    api.getUsers(),
                    api.getTeams(),
                    api.getProjects()
                ]);
                
                const usersData = u.data || [];
                const teamsData = t.data || [];
                const projectsData = p.data || [];
                
                setStats({
                    users: usersData.length,
                    teams: teamsData.length,
                    projects: projectsData.length
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSuccess = () => {
        window.location.reload();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
    );

    return (
        <div className="p-4">
            {/* Welcome Banner */}
            <WelcomeBanner user={user} />

            {/* Stats Overview */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">System Overview</h2>
                        <p className="text-xs text-text-muted">Real-time statistics and insights</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <StatCard 
                        title="Total Users" 
                        value={stats.users} 
                        icon={Users} 
                        color="brand-green" 
                        onClick={() => navigate('/users')}
                        subtitle="Manage personnel"
                    />
                    <StatCard 
                        title="Active Teams" 
                        value={stats.teams} 
                        icon={Network} 
                        color="info" 
                        onClick={() => navigate('/teams')}
                        subtitle="View teams"
                    />
                    <StatCard 
                        title="All Projects" 
                        value={stats.projects} 
                        icon={Briefcase} 
                        color="brand-blue" 
                        onClick={() => navigate('/projects')}
                        subtitle="View projects"
                    />
                </div>
            </section>

            {/* Quick Actions Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Administrative Actions</h2>
                        <p className="text-xs text-text-muted">Quick access to management tools</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <QuickActionCard 
                        icon={UserPlus} 
                        label="Add User" 
                        description="Onboard new personnel"
                        onClick={() => setShowUserModal(true)}
                        color="brand-green"
                    />
                    <QuickActionCard 
                        icon={PlusCircle} 
                        label="Create Team" 
                        description="Form operational units"
                        onClick={() => setShowTeamModal(true)}
                        color="info"
                    />
                    <QuickActionCard 
                        icon={BarChart3} 
                        label="View Reports" 
                        description="Analyze performance"
                        onClick={() => navigate('/reports')}
                        color="brand-blue"
                    />
                    <QuickActionCard 
                        icon={FileText} 
                        label="All Projects" 
                        description="Browse all projects"
                        onClick={() => navigate('/projects')}
                        color="success"
                    />
                </div>
            </section>

            {/* Modals */}
            <CreateUserModal 
                isOpen={showUserModal} 
                onClose={() => setShowUserModal(false)}
                onSuccess={handleSuccess}
            />
            <CreateTeamModal 
                isOpen={showTeamModal} 
                onClose={() => setShowTeamModal(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default AdminDashboard;
