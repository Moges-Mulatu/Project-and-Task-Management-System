import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api.service';

const EditTeamModal = ({ isOpen, onClose, onSuccess, teamId }) => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        teamLeadId: '',
        memberIds: []
    });
    const [users, setUsers] = useState([]);
    const [currentMembers, setCurrentMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && teamId) {
            // Load team data, users, and current members
            Promise.all([
                api.getTeam(teamId),
                api.getUsers(),
                api.getTeamMembers(teamId)
            ]).then(([teamRes, usersRes, membersRes]) => {
                const team = teamRes.data;
                const members = membersRes.data || [];
                
                setFormData({
                    name: team.name || '',
                    department: team.department || '',
                    teamLeadId: team.teamLeadId || '',
                    memberIds: members.map(m => m.userId)
                });
                setUsers(usersRes.data || []);
                setCurrentMembers(members);
            }).catch(err => {
                setError(err.message);
            });
        }
    }, [isOpen, teamId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Update team basic info
            await api.updateTeam(teamId, {
                name: formData.name,
                department: formData.department,
                teamLeadId: formData.teamLeadId
            });
            
            // Handle member changes
            const currentMemberIds = currentMembers.map(m => m.userId);
            const newMemberIds = formData.memberIds;
            
            // Remove members who are no longer selected (except team lead)
            const membersToRemove = currentMemberIds.filter(id => 
                !newMemberIds.includes(id) && id !== formData.teamLeadId
            );
            
            // Add new members (except team lead who is already assigned)
            const membersToAdd = newMemberIds.filter(id => 
                !currentMemberIds.includes(id) && id !== formData.teamLeadId
            );
            
            // Remove members
            for (const memberId of membersToRemove) {
                await api.removeTeamMember(teamId, memberId);
            }
            
            // Add members
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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Operational Unit">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Team Name</label>
                        <input
                            required
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Department</label>
                        <input
                            required
                            className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-1 focus:ring-brand-blue outline-none"
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
                        <div className="max-h-48 overflow-y-auto bg-background-tertiary border border-card-border rounded-xl p-3 space-y-2">
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
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-card-border mt-6">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="secondary" loading={loading} type="submit">Update Unit</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTeamModal;
