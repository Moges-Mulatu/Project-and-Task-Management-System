import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Teams = () => {
    const { user: currentUser } = useAuth();
    const permissions = ROLE_PERMISSIONS[currentUser?.role];
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', description: '', department: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await apiService.getTeams();
            setTeams(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
            setError('Failed to load teams.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await apiService.createTeam(newTeam);
            if (res.success) {
                setShowCreateModal(false);
                setNewTeam({ name: '', description: '', department: '' });
                fetchTeams();
            }
        } catch (err) {
            console.error('Failed to create team:', err);
            alert('Failed to create team.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTeam = async (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await apiService.deleteTeam(id);
                fetchTeams();
            } catch (err) {
                console.error('Failed to delete team:', err);
                alert('Failed to delete team.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
                        Teams & Departments
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">Organize your workforce into functional teams</p>
                </div>
                {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.PROJECT_MANAGER) && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create New Team
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            ) : error ? (
                <div className="p-12 text-center text-error bg-card-background rounded-2xl border border-card-border">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Card key={team.id} className="hover:shadow-card-lg transition-all duration-300 group overflow-hidden">
                            <Card.Body className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-brand-blue to-purple-600 rounded-xl flex items-center justify-center text-xl text-white font-bold shadow-lg">
                                        {team.name[0]}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(currentUser.role === ROLES.ADMIN) && (
                                            <button
                                                onClick={() => handleDeleteTeam(team.id)}
                                                className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-text-primary mb-1">{team.name}</h3>
                                <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-3">{team.department || 'General'}</p>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-6 h-10">
                                    {team.description || 'No description provided for this team.'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-card-border/50">
                                    <div className="flex -space-x-2">
                                        {/* Mock avatars for members */}
                                        <div className="h-8 w-8 rounded-full border-2 border-card-background bg-brand-blue flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                                        <div className="h-8 w-8 rounded-full border-2 border-card-background bg-brand-green flex items-center justify-center text-[10px] text-white font-bold">AS</div>
                                        <div className="h-8 w-8 rounded-full border-2 border-card-background bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold">+5</div>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-wider py-1">
                                        Manage Members
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                    {teams.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <p className="text-text-muted italic">No teams have been created yet.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Team"
                footer={(
                    <>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateTeam} disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Team'}
                        </Button>
                    </>
                )}
            >
                <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Team Name</label>
                        <input
                            type="text"
                            required
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-blue/50 outline-none"
                            placeholder="e.g. Frontend Developers"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Department</label>
                        <input
                            type="text"
                            value={newTeam.department}
                            onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-blue/50 outline-none"
                            placeholder="e.g. Engineering"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={newTeam.description}
                            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                            className="w-full px-4 py-2 bg-background-tertiary border border-card-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-blue/50 outline-none"
                            placeholder="What is the purpose of this team?"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Teams;
