import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import { CheckSquare, Clock, AlertCircle, Users, TrendingUp, Award, Calendar, UserCheck } from 'lucide-react';
import UpdateTaskModal from '../../components/modals/UpdateTaskModal';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
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
        'brand-green': 'bg-brand-green/10 text-brand-green border-brand-green/20',
        'info': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'brand-blue': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
        'success': 'bg-green-500/10 text-green-400 border-green-500/20'
    };

    return (
        <button
            onClick={onClick}
            className="group relative overflow-hidden rounded-xl border border-card-border bg-card-background p-4 text-left transition-all hover:border-brand-green/50 hover:shadow-lg active:scale-[0.98]"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
                <div className={`w-10 h-10 rounded-lg border ${colorClasses[color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
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
                <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Award className="w-3 h-3 text-brand-green" />
                    <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Team Member</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">
                    Welcome back, {user?.firstName || 'Team Member'}
                </h1>
                <p className="text-sm text-text-secondary">
                    Track your tasks, manage your workload, and collaborate with your team.
                </p>
            </div>
        </div>
    </div>
);

const MemberDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            // Backend handles role-based filtering, so we just call getTasks()
            const response = await api.getTasks();
            setTasks(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchMyTasks();
    }, [user]);

    const todoTasks = tasks.filter(t => t.status === 'todo' || !t.status);
    const inProgressTasks = tasks.filter(t => t.status === 'in progress' || t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Calculate performance metrics
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    const activeTasks = todoTasks.length + inProgressTasks.length;

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
                        <h2 className="text-lg font-bold text-text-primary">My Performance</h2>
                        <p className="text-xs text-text-muted">Task metrics and productivity insights</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <StatCard 
                        title="Total Tasks" 
                        value={tasks.length} 
                        icon={CheckSquare} 
                        color="brand-blue" 
                        onClick={() => navigate('/tasks')}
                        subtitle="All assigned tasks"
                    />
                    <StatCard 
                        title="Active Work" 
                        value={activeTasks} 
                        icon={Clock} 
                        color="info" 
                        subtitle="In progress"
                    />
                    <StatCard 
                        title="Completed" 
                        value={completedTasks.length} 
                        icon={Award} 
                        color="brand-green" 
                        subtitle={`${completionRate}% completion rate`}
                    />
                </div>
            </section>

            {/* Task Kanban Board */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">My Work</h2>
                        <p className="text-xs text-text-muted">Personal task management and progress tracking.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-text-muted px-2">
                            <AlertCircle size={18} />
                            <span className="font-bold uppercase tracking-wider text-xs">To Do ({todoTasks.length})</span>
                        </div>
                        {todoTasks.map(task => (
                            <Card
                                key={task.id}
                                className="border-l-4 border-l-warning cursor-pointer hover:bg-background-tertiary transition-all active:scale-[0.98] group"
                                onClick={() => setSelectedTask(task)}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-text-primary text-sm">{task.title}</h4>
                                    <div className="text-[10px] font-bold text-warning border border-warning/30 px-2 py-0.5 rounded-full bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Manage →
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted mt-1 line-clamp-1">{task.description}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-info px-2">
                            <Clock size={18} />
                            <span className="font-bold uppercase tracking-wider text-xs">In Progress ({inProgressTasks.length})</span>
                        </div>
                        {inProgressTasks.map(task => (
                            <Card
                                key={task.id}
                                className="border-l-4 border-l-info cursor-pointer hover:bg-background-tertiary transition-all active:scale-[0.98] group"
                                onClick={() => setSelectedTask(task)}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-text-primary text-sm">{task.title}</h4>
                                    <div className="text-[10px] font-bold text-info border border-info/30 px-2 py-0.5 rounded-full bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Update Progress →
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-[10px] font-bold text-info">{task.progress}%</span>
                                </div>
                                <div className="mt-2 w-full h-1 bg-background-tertiary rounded-full overflow-hidden">
                                    <div className="h-full bg-info" style={{ width: `${task.progress}%` }} />
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-brand-green px-2">
                            <CheckSquare size={18} />
                            <span className="font-bold uppercase tracking-wider text-xs">Completed ({completedTasks.length})</span>
                        </div>
                        {completedTasks.map(task => (
                            <Card
                                key={task.id}
                                className="border-l-4 border-l-brand-green opacity-75 cursor-pointer hover:bg-background-tertiary transition-all active:scale-[0.98] group"
                                onClick={() => setViewingTask(task)}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-text-primary text-sm line-through decoration-text-muted">{task.title}</h4>
                                    <div className="text-[10px] font-bold text-brand-green border border-brand-green/30 px-2 py-0.5 rounded-full bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        View History →
                                    </div>
                                </div>
                                <p className="text-[10px] text-brand-green font-bold mt-1">Well done!</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modals */}
            {selectedTask && (
                <UpdateTaskModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onSuccess={fetchMyTasks}
                />
            )}

            {viewingTask && (
                <TaskDetailsModal
                    isOpen={!!viewingTask}
                    onClose={() => setViewingTask(null)}
                    task={viewingTask}
                />
            )}
        </div>
    );
};

export default MemberDashboard;
