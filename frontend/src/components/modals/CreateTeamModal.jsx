import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';
import { Users, X } from 'lucide-react';

const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        teamLeadId: ''
    });
    const [users, setUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
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
            // Step 1: Create team
            const team = await api.createTeam(formData);
            
            // Step 2: Add selected members to team
            if (selectedMembers.length > 0) {
                const memberPromises = selectedMembers.map(userId => 
                    api.addTeamMember(team.data.id, userId, 'member')
                );
                await Promise.all(memberPromises);
            }
            
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMemberSelection = (userId) => {
        setSelectedMembers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const removeSelectedMember = (userId) => {
        setSelectedMembers(prev => prev.filter(id => id !== userId));
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
                        {users.filter(u => u.role !== 'admin').map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.replace('_', ' ')})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Team Members</label>
                    <div className="space-y-2">
                        {/* Multi-select dropdown */}
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-card-border rounded-xl p-3">
                            {users.filter(u => u.role !== 'admin' && u.id !== formData.teamLeadId).map(u => (
                                <label key={u.id} className="flex items-center space-x-3 cursor-pointer hover:bg-background-tertiary p-2 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(u.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedMembers(prev => [...prev, u.id]);
                                            } else {
                                                setSelectedMembers(prev => prev.filter(id => id !== u.id));
                                            }
                                        }}
                                        className="w-4 h-4 text-brand-green focus:ring-brand-green"
                                    />
                                    <span className="text-sm text-text-primary">
                                        {u.firstName} {u.lastName}
                                    </span>
                                </label>
                            ))}
                        </div>
                        
                        {/* Selected members display */}
                        {selectedMembers.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-text-muted mb-2">Selected Members:</p>
                                <div className="space-y-1">
                                    {selectedMembers.map(memberId => {
                                        const member = users.find(u => u.id === memberId);
                                        return member ? (
                                            <div key={memberId} className="flex items-center justify-between bg-background-tertiary border border-card-border rounded-lg px-3 py-2">
                                                <span className="text-sm text-text-primary">
                                                    {member.firstName} {member.lastName}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedMember(memberId)}
                                                    className="text-text-muted hover:text-error transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
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
