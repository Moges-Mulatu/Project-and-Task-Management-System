import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Network, Users as UsersIcon, Edit, Trash2 } from 'lucide-react';
import CreateTeamModal from '../../components/modals/CreateTeamModal';
import EditTeamModal from '../../components/modals/EditTeamModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast.jsx';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingTeamId, setDeletingTeamId] = useState(null);
    const { success, error, ToastContainer } = useToast();

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await api.getTeams();
            setTeams(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleEdit = (teamId) => {
        setEditingTeamId(teamId);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (teamId) => {
        setDeletingTeamId(teamId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.deleteTeam(deletingTeamId);
            success('Team deleted successfully');
            fetchTeams();
        } catch (err) {
            error(err.message || 'Failed to delete team');
        } finally {
            setDeletingTeamId(null);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Operational Units</h2>
                    <p className="text-text-secondary text-sm">Strategic organization of departmental engineering teams.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" />
                    Form New Unit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-64 bg-card-background animate-pulse rounded-2xl"></div>)
                ) : teams.map(team => (
                    <Card key={team.id} className="relative group overflow-hidden border-2 border-transparent hover:border-brand-blue/30 transition-all">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <button
                                onClick={() => handleEdit(team.id)}
                                className="p-2 bg-background-tertiary border border-card-border rounded-lg hover:bg-brand-blue/10 hover:border-brand-blue/30 transition-all"
                                title="Edit Team"
                            >
                                <Edit size={16} className="text-brand-blue" />
                            </button>
                            <button
                                onClick={() => handleDelete(team.id)}
                                className="p-2 bg-background-tertiary border border-card-border rounded-lg hover:bg-error/10 hover:border-error/30 transition-all"
                                title="Delete Team"
                            >
                                <Trash2 size={16} className="text-error" />
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 rounded-2xl bg-brand-blue/10 text-brand-blue shadow-inner">
                                    <Network size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-text-primary truncate">{team.name}</h3>
                                    <p className="text-xs font-bold text-brand-blue uppercase tracking-[0.2em] mt-1">{team.department || 'General Division'}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-text-secondary line-clamp-2 italic h-10 mb-6">
                            {team.description || 'Strategic unit description pending authorization...'}
                        </p>

                        <div className="flex items-center justify-between border-t border-card-border pt-6">
                            <div className="flex items-center -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-card-background bg-background-tertiary flex items-center justify-center font-bold text-text-muted text-[10px] shadow-lg group-hover:-translate-y-1 transition-transform">U{i}</div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-4 border-card-background bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-[10px] shadow-lg">+5</div>
                            </div>
                            <div className="flex items-center text-xs font-bold text-brand-green">
                                <UsersIcon size={14} className="mr-1.5" />
                                Active Unit
                            </div>
                        </div>
                    </Card>
                ))}
                {teams.length === 0 && !loading && <div className="col-span-full py-12 text-center text-text-muted opacity-50 italic">Strategic records empty.</div>}
            </div>

            <CreateTeamModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTeams}
            />
            
            <EditTeamModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTeamId(null);
                }}
                onSuccess={fetchTeams}
                teamId={editingTeamId}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Team"
                message="Are you sure you want to delete this team? This action cannot be undone."
                confirmText="Delete Team"
                type="danger"
            />
        </div>
        </>
    );
};

export default Teams;
