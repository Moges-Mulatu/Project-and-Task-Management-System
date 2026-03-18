import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { CheckSquare, Calendar, User, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import UpdateTaskModal from '../../components/modals/UpdateTaskModal';
import { useToast } from '../../hooks/useToast.jsx';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { error, ToastContainer } = useToast();

    const isPM = user?.role === ROLES.PROJECT_MANAGER;

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const response = isPM
                    ? await api.getTasks(`?projectManagerId=${user.id}`)
                    : await api.getTasks();
                setTasks(response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (s === 'completed') return 'text-brand-green bg-brand-green/10';
        if (s === 'in progress' || s === 'in_progress') return 'text-info bg-info/10';
        if (s === 'todo') return 'text-warning bg-warning/10';
        return 'text-text-muted bg-background-tertiary';
    };

    const [selectedTask, setSelectedTask] = useState(null);

    const handleAction = (task) => {
        if (user?.role === ROLES.TEAM_MEMBER) {
            if (task.assignedTo === user.id) {
                setSelectedTask(task);
            } else {
                error('Access Denied: You can only update tasks assigned to you.');
            }
        } else {
            // Admin/PM view logic or general update
            setSelectedTask(task);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Operations Hub</h2>
                    <p className="text-text-secondary text-sm">Individual task management and status synchronization.</p>
                </div>
                {isPM && (
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" />
                        Assign Task
                    </Button>
                )}
            </div>

            <div className="bg-card-background border border-card-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-secondary/50 border-b border-card-border">
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Operation</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Deadline</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-6 h-16 bg-background-tertiary/20"></td>
                                    </tr>
                                ))
                            ) : tasks.map(task => (
                                <tr key={task.id} className="hover:bg-background-tertiary/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center text-brand-green">
                                                <CheckSquare size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-primary line-clamp-1">{task.title}</p>
                                                <p className="text-xs text-text-muted flex items-center mt-0.5">
                                                    <User size={10} className="mr-1" /> 
                                                    {task.assignedUser ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` : 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                            {task.status || 'Ready'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-text-secondary w-8">{task.progress || 0}%</span>
                                            <div className="flex-1 h-1 bg-background-tertiary rounded-full overflow-hidden max-w-[80px]">
                                                <div className="h-full bg-brand-green" style={{ width: `${task.progress || 0}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-text-muted">
                                            <Calendar size={12} className="mr-1.5" />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAction(task)}
                                            className="text-text-muted hover:text-brand-green transition-colors"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted italic">
                                        No active operations found in your registry.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => window.location.reload()}
            />

            {selectedTask && (
                <UpdateTaskModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    task={selectedTask}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
        </>
    );
};

export default Tasks;
