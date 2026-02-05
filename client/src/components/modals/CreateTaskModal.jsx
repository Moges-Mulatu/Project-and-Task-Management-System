import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const CreateTaskModal = ({ isOpen, onClose, onSuccess, initialProjectId = '' }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: initialProjectId,
        assignedTo: '',
        deadline: '',
        priority: 'medium',
        type: 'task'
    });

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    setDataLoading(true);
                    const [projRes, userRes] = await Promise.all([
                        apiService.getProjects(),
                        apiService.getUsers()
                    ]);
                    setProjects(projRes.data || []);
                    setUsers(userRes.data || []);

                    if (initialProjectId) {
                        setFormData(prev => ({ ...prev, projectId: initialProjectId }));
                    }
                } catch (err) {
                    console.error('Failed to fetch modal data:', err);
                    setError('Failed to load project or user data.');
                } finally {
                    setDataLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, initialProjectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.projectId || !formData.assignedTo) {
            setError('Please select a project and an assignee.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiService.createTask(formData);
            if (response.success) {
                onSuccess(response.data);
                onClose();
                setFormData({
                    title: '',
                    description: '',
                    projectId: initialProjectId,
                    assignedTo: '',
                    deadline: '',
                    priority: 'medium',
                    type: 'task'
                });
            }
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.message || 'Failed to create task. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || dataLoading}>
                {loading ? 'Creating...' : 'Create Task'}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Task"
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
                        Task Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Implement User Authentication"
                        className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="What needs to be done?"
                        className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Project
                        </label>
                        <select
                            name="projectId"
                            required
                            value={formData.projectId}
                            onChange={handleChange}
                            disabled={initialProjectId !== ''}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Assign To
                        </label>
                        <select
                            name="assignedTo"
                            required
                            value={formData.assignedTo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        >
                            <option value="">Select Assignee</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Deadline
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            required
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        >
                            <option value="task">Task</option>
                            <option value="bug">Bug</option>
                            <option value="feature">Feature</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Priority
                    </label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
