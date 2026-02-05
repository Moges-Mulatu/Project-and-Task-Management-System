import React, { useState } from 'react';
import { apiService } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'planning'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.createProject(formData);
            if (response.success) {
                onSuccess(response.data);
                onClose();
                setFormData({
                    name: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    priority: 'medium',
                    status: 'planning'
                });
            }
        } catch (err) {
            console.error('Failed to create project:', err);
            setError(err.message || 'Failed to create project. Please check all fields.');
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
                {loading ? 'Creating...' : 'Create Project'}
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Project"
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
                        Project Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Website Redesign"
                        className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe the project goals and scope..."
                        className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            required
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1 tracking-wider">
                            Initial Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                        >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default CreateProjectModal;
