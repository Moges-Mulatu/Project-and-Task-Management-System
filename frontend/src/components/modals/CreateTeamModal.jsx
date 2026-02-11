import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';

const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        teamLeadId: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.getUsers().then(res => setUsers(res.data || []));
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.createTeam(formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Form New Operational Unit">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Team Name</label>
                    <input
                        required
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                        placeholder="e.g. Backend Development Alpha"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Department</label>
                    <input
                        required
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                        placeholder="e.g. Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Team Lead</label>
                    <select
                        required
                        className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none appearance-none"
                        value={formData.teamLeadId}
                        onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
                    >
                        <option value="">Select a Lead...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.replace('_', ' ')})</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-error text-xs font-medium bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="secondary" loading={loading} type="submit">Establish Unit</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTeamModal;
