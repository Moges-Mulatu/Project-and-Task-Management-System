import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import UpdateTaskModal from '../../components/modals/UpdateTaskModal';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';

import { useAuth } from '../../context/AuthContext';

const MemberDashboard = () => {
    const { user } = useAuth();
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

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">My Work</h2>
                <p className="text-text-secondary">Personal task management and progress tracking.</p>
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
