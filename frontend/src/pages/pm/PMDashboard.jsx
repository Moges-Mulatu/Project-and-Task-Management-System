import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Briefcase, ListTodo, MoreHorizontal, Clock, Plus, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateProjectModal from '../../components/modals/CreateProjectModal';
import CreateTaskModal from '../../components/modals/CreateTaskModal';

const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => {
    const colorClasses = {
        'brand-blue': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
        'brand-green': 'bg-brand-green/10 text-brand-green border-brand-green/20',
        'info': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'warning': 'bg-orange-500/10 text-orange-400 border-orange-500/20'
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
        'brand-blue': 'from-brand-blue/20 to-brand-blue/5 border-brand-blue/30 hover:border-brand-blue',
        'brand-green': 'from-brand-green/20 to-brand-green/5 border-brand-green/30 hover:border-brand-green',
        'info': 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-400',
        'warning': 'from-orange-500/20 to-orange-500/5 border-orange-500/30 hover:border-orange-400'
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue/20 via-brand-green/20 to-brand-blue/20 border border-brand-blue/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-brand-green" />
                    <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Project Manager</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">
                    Welcome back, {user?.firstName || 'PM'}
                </h1>
                <p className="text-sm text-text-secondary">
                    Manage your projects, tasks, and team performance from one central hub.
                </p>
            </div>
        </div>
    </div>
);

const PMDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({ projects: [], tasks: [] });
    const [loading, setLoading] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);

    useEffect(() => {
        const fetchPMData = async () => {
            if (!user) return;
            try {
                const [p, t] = await Promise.all([
                    api.getProjects(`?projectManagerId=${user.id}`),
                    api.getTasks(`?projectManagerId=${user.id}`)
                ]);
                setData({
                    projects: p.data || [],
                    tasks: t.data || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPMData();
    }, [user]);

    const handleSuccess = () => {
        const fetchPMData = async () => {
            if (!user) return;
            try {
                const [p, t] = await Promise.all([
                    api.getProjects(`?projectManagerId=${user.id}`),
                    api.getTasks(`?projectManagerId=${user.id}`)
                ]);
                setData({
                    projects: p.data || [],
                    tasks: t.data || []
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchPMData();
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
                        <h2 className="text-lg font-bold text-text-primary">Project Overview</h2>
                        <p className="text-xs text-text-muted">Real-time project and task metrics</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                        title="My Projects" 
                        value={data.projects.length} 
                        icon={Briefcase} 
                        color="brand-blue" 
                        onClick={() => navigate('/projects')}
                        subtitle="Manage projects"
                    />
                    <StatCard 
                        title="Managed Tasks" 
                        value={data.tasks.length} 
                        icon={ListTodo} 
                        color="brand-green" 
                        onClick={() => navigate('/tasks')}
                        subtitle="View tasks"
                    />
                </div>
            </section>

            {/* Quick Actions Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Quick Actions</h2>
                        <p className="text-xs text-text-muted">Common project management tasks</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <QuickActionCard 
                        icon={Plus} 
                        label="Create Project" 
                        description="Start new project"
                        onClick={() => setShowProjectModal(true)}
                        color="brand-blue"
                    />
                    <QuickActionCard 
                        icon={ListTodo} 
                        label="Add Task" 
                        description="Create new task"
                        onClick={() => setShowTaskModal(true)}
                        color="brand-green"
                    />
                </div>
            </section>

            {/* Create Project Modal */}
            <CreateProjectModal 
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                onSuccess={handleSuccess}
            />

            {/* Create Task Modal */}
            <CreateTaskModal 
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default PMDashboard;
