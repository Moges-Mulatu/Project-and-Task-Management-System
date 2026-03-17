import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';

import { ChevronDown } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        deadline: '',
        priority: 'medium',
        type: 'feature'
    });
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            const fetch = async () => {
                try {
                    const projectsRes = user?.role === ROLES.PROJECT_MANAGER
                        ? await api.getProjects(`?projectManagerId=${user.id}`)
                        : await api.getProjects();
                    setProjects(projectsRes.data || []);

                    // default users list: if PM, keep team members to be loaded when project selected
                    if (user?.role === ROLES.ADMIN) {
                        const usersRes = await api.getUsers();
                        setUsers(usersRes.data || []);
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            fetch();
        }
    }, [isOpen, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.createTask({
                ...formData,
                dueDate: formData.deadline // Map to backend field
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // when projectId changes, load team members for that project
    useEffect(() => {
        const loadMembers = async () => {
            if (!formData.projectId) {
                setUsers([]);
                return;
            }
            try {
                // Find the project in our already loaded list to get the teamId
                // This avoids an extra API call that might fail due to strict UUID validation on seed data
                const selectedProj = projects.find(p => p.id === formData.projectId);
                const teamId = selectedProj?.teamId;

                if (teamId) {
                    const members = await api.getTeamMembers(teamId);
                    setUsers(members.data || []);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                console.error('Failed to load team members for project', err);
            }
        };
        loadMembers();
    }, [formData.projectId, projects]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign New Operation">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Operation Title</label>
                    <input
                        required
                        placeholder="Name of the mission unit..."
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Strategic Description</label>
                    <textarea
                        required
                        rows="3"
                        placeholder="Detail the technical requirements and objectives..."
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Project Hub</label>
                        <div className="relative">
                            <select
                                required
                                className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none appearance-none pr-10"
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            >
                                <option value="">Select Project...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Assignee</label>
                        <div className="relative">
                            <select
                                required
                                className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none appearance-none pr-10"
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            >
                                <option value="">Select Member...</option>
                                {users.map(u => <option key={u.id} value={u.userId}>{u.firstName} {u.lastName}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Due Date</label>
                        <input
                            required
                            type="date"
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Priority</label>
                        <div className="relative">
                            <select
                                className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none appearance-none pr-10"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</label>
                        <div className="relative">
                            <select
                                className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-green outline-none appearance-none pr-10"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="feature">Feature</option>
                                <option value="bug">Bug</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                {error && <p className="text-error text-xs font-medium bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Discard</Button>
                    <Button variant="primary" loading={loading} type="submit">Deploy Operation</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
