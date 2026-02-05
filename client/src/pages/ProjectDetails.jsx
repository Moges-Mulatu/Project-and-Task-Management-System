import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreateTaskModal from '../components/modals/CreateTaskModal';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const permissions = ROLE_PERMISSIONS[user?.role];

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectRes, tasksRes] = await Promise.all([
                apiService.getProject(id),
                apiService.getTasks(id) // Get tasks for this specific project
            ]);
            setProject(projectRes.data);
            setTasks(tasksRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch project details:', err);
            setError('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'on_hold': return 'bg-red-100 text-red-800';
            case 'planning': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="p-8 text-center bg-card-background rounded-xl border border-card-border">
                <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
                <p className="text-text-secondary mb-6">{error || 'Project not found'}</p>
                <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
            </div>
        );
    }

    const projectStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status?.toLowerCase() === 'completed').length,
        inProgress: tasks.filter(t => t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in_progress').length,
        todo: tasks.filter(t => t.status?.toLowerCase() === 'todo' || t.status?.toLowerCase() === 'not started').length,
    };

    const progressPercentage = Math.round((projectStats.completed / (projectStats.total || 1)) * 100);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/projects')} className="border-card-border">
                        ← Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
                            {project.name}
                        </h1>
                        <span className={`inline-flex px-2 mt-1 py-0.5 text-[10px] font-bold rounded-full border ${getStatusColor(project.status || 'planning')} uppercase tracking-wider`}>
                            {project.status?.replace('_', ' ') || 'planning'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {permissions?.canCreateTasks && (
                        <Button onClick={() => setShowCreateTaskModal(true)}>
                            Add Task
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <Card.Body className="p-8">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">About Project</h3>
                            <p className="text-text-secondary leading-relaxed mb-8">
                                {project.description || 'No description provided.'}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-card-border/50">
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Start Date</p>
                                    <p className="text-sm font-bold text-text-primary">{new Date(project.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Deadline</p>
                                    <p className="text-sm font-bold text-text-primary">{new Date(project.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Priority</p>
                                    <p className="text-sm font-bold text-text-primary capitalize">{project.priority || 'Medium'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Overall Progress</p>
                                    <p className="text-sm font-bold text-brand-green">{progressPercentage}%</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-text-primary">Project Tasks</h3>
                            <span className="text-xs font-bold text-text-muted uppercase">{tasks.length} Total</span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-card-border/30">
                                    <thead className="bg-background-secondary/10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Task</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Assignee</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-text-muted uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-card-border/20">
                                        {tasks.map(task => (
                                            <tr key={task.id} className="hover:bg-background-secondary/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-text-primary">{task.title}</div>
                                                    <div className="text-[10px] text-text-muted uppercase">Due {new Date(task.deadline).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-6 w-6 rounded-full bg-brand-blue/20 text-[10px] flex items-center justify-center font-bold text-brand-blue mr-2">
                                                            {task.Assignee?.firstName?.[0] || '?'}
                                                        </div>
                                                        <span className="text-sm text-text-secondary">
                                                            {task.Assignee ? `${task.Assignee.firstName} ${task.Assignee.lastName}` : 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {task.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                                        className="text-brand-blue text-xs font-bold hover:underline"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {tasks.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-text-muted italic text-sm">
                                                    This project has no tasks yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Right Column: Stats & Progress */}
                <div className="space-y-6">
                    <Card>
                        <Card.Body className="p-6">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Execution Status</h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-text-primary">Completion Rate</span>
                                        <span className="text-xl font-bold text-brand-green">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-background-tertiary rounded-full overflow-hidden border border-card-border/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-brand-blue to-brand-green transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-background-secondary/20 rounded-xl border border-card-border/30">
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">To Do</p>
                                        <p className="text-xl font-bold text-text-primary">{projectStats.todo}</p>
                                    </div>
                                    <div className="p-4 bg-background-secondary/20 rounded-xl border border-card-border/30">
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">In Progress</p>
                                        <p className="text-xl font-bold text-text-primary">{projectStats.inProgress}</p>
                                    </div>
                                    <div className="p-4 bg-background-secondary/20 rounded-xl border border-card-border/30">
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Completed</p>
                                        <p className="text-xl font-bold text-text-primary">{projectStats.completed}</p>
                                    </div>
                                    <div className="p-4 bg-background-secondary/20 rounded-xl border border-card-border/30">
                                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Total Tasks</p>
                                        <p className="text-xl font-bold text-text-primary">{projectStats.total}</p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-gradient-to-br from-brand-blue/90 to-purple-600/90 text-white border-0 shadow-lg shadow-brand-blue/20">
                        <Card.Body className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-white uppercase tracking-tighter">Timeline Health</h3>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed mb-4">
                                {progressPercentage >= 50
                                    ? "Project is moving at a healthy pace. Keep up the momentum to hit your delivery target."
                                    : "Consider assigning more resources if the deadline is approaching. Target 50% completion by mid-term."}
                            </p>
                            <div className="text-xs font-bold text-white/60 uppercase">
                                Est. Delivery: {new Date(project.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <CreateTaskModal
                isOpen={showCreateTaskModal}
                onClose={() => setShowCreateTaskModal(false)}
                onSuccess={fetchProjectData}
                initialProjectId={id}
            />
        </div>
    );
};

export default ProjectDetails;
