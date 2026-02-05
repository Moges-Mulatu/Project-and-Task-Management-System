import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { apiService } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const EditTaskModal = ({ isOpen, onClose, onSuccess, task }) => {
    const { user: currentUser } = useAuth();
    const isTeamMember = currentUser?.role === ROLES.TEAM_MEMBER;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: '',
        priority: '',
        assignedTo: '',
        progress: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                try {
                    const res = await apiService.getUsers();
                    setUsers(res.data || []);
                } catch (err) {
                    console.error('Failed to fetch users:', err);
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                assignedTo: task.assignedTo || '',
                progress: task.progress || 0
            });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'progress' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let payload = formData;
            if (isTeamMember) {
                payload = {
                    status: formData.status,
                    progress: formData.progress
                };
            }

            const response = await apiService.updateTask(task.id, payload);
            if (response.success) {
                onSuccess(response.data);
                onClose();
            }
        } catch (err) {
            console.error('Failed to update task:', err);
            setError(err.message || 'Failed to update task.');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Task"
            footer={footer}
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        disabled={isTeamMember}
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${isTeamMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Progress ({formData.progress}%)
                    </label>
                    <input
                        type="range"
                        name="progress"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.progress}
                        onChange={handleChange}
                        className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Description
                    </label>
                    <textarea
                        name="description"
                        disabled={isTeamMember}
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${isTeamMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Assign To
                    </label>
                    <select
                        name="assignedTo"
                        required
                        disabled={isTeamMember}
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${isTeamMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Select Assignee</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        >
                            <option value="todo">To Do</option>
                            <option value="in progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Priority
                        </label>
                        <select
                            name="priority"
                            disabled={isTeamMember}
                            value={formData.priority}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${isTeamMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EditTaskModal;
