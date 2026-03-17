import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';

const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        teamLeadId: '',
        memberIds: []
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
            // Create team first
            const teamResponse = await api.createTeam({
                name: formData.name,
                department: formData.department,
                teamLeadId: formData.teamLeadId
            });
            
            const teamId = teamResponse.data.id;
            
            // Add team members (excluding the team lead who is already assigned)
            const membersToAdd = formData.memberIds.filter(id => id !== formData.teamLeadId);
            
            for (const memberId of membersToAdd) {
                await api.addTeamMember(teamId, memberId);
            }
            
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

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Team Members</label>
                    <div className="max-h-32 overflow-y-auto bg-background-tertiary border border-card-border rounded-xl p-3 space-y-2">
                        {users.map(u => (
                            <label key={u.id} className="flex items-center space-x-2 cursor-pointer hover:bg-background-secondary p-1 rounded">
                                <input
                                    type="checkbox"
                                    className="rounded border-card-border text-brand-blue focus:ring-brand-blue"
                                    checked={formData.memberIds.includes(u.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ 
                                                ...formData, 
                                                memberIds: [...formData.memberIds, u.id] 
                                            });
                                        } else {
                                            setFormData({ 
                                                ...formData, 
                                                memberIds: formData.memberIds.filter(id => id !== u.id) 
                                            });
                                        }
                                    }}
                                />
                                <span className="text-sm text-text-primary">
                                    {u.firstName} {u.lastName} ({u.role.replace('_', ' ')})
                                </span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-text-muted">
                        Selected: {formData.memberIds.length} member{formData.memberIds.length !== 1 ? 's' : ''}
                    </p>
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
