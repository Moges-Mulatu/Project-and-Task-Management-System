import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        teamId: '',
        priority: 'medium'
    });
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.getTeams().then(res => setTeams(res.data || []));
        }
    }, [isOpen]);

    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData };
            if (user?.role === 'project_manager') payload.projectManagerId = user.id;
            await api.createProject(payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initialize New Project">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Project Name</label>
                    <input
                        required
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</label>
                    <textarea
                        required
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Start Date</label>
                        <input
                            required
                            type="date"
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Target Deadline</label>
                        <input
                            required
                            type="date"
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Priority Level</label>
                        <select
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none appearance-none"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Assigned Team</label>
                        <select
                            required
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none appearance-none"
                            value={formData.teamId}
                            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                        >
                            <option value="">Select Team...</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                {error && <p className="text-error text-xs font-medium bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="secondary" loading={loading} type="submit">Deploy Project</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateProjectModal;
