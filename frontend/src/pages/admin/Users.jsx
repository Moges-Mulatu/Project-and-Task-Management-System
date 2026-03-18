import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UserPlus, Shield, UserX, Mail, UserCheck } from 'lucide-react';
import CreateUserModal from '../../components/modals/CreateUserModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.getUsers();
            setUsers(response.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        setDeleteConfirmation(id);
    };
    
    const confirmDelete = async () => {
        const userId = deleteConfirmation;
        setDeleteConfirmation(null);
        try {
            console.log('Attempting to delete user:', userId);
            await api.deleteUser(userId);
            console.log('Delete successful');
            fetchUsers();
        } catch (err) {
            console.error('Delete failed:', err);
            alert(`Failed to deactivate user: ${err.message || 'Unknown error'}`);
        }
    };
    
    const handleReactivate = async (id) => {
        try {
            await api.reactivateUser(id);
            fetchUsers();
        } catch (err) {
            console.error('Reactivate failed:', err);
        }
    };
    
    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-error/20 text-error border-error/50';
            case 'project_manager': return 'bg-info/20 text-info border-info/50';
            default: return 'bg-brand-green/20 text-brand-green border-brand-green/50';
        }
    };

    // prepare list content to avoid complex inline JSX ternary
    const listContent = loading
        ? [1, 2, 3].map(i => <div key={i} className="h-40 bg-card-background animate-pulse rounded-2xl"></div>)
        : users.map(u => (
            <Card key={u.id} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Reactivate button for inactive users */}
                    {!u.isActive && currentUser?.id !== u.id && (
                        <button
                            onClick={() => handleReactivate(u.id)}
                            className="text-brand-green hover:scale-110 transition-transform mr-2"
                            title="Reactivate user"
                        >
                            <UserCheck size={18} />
                        </button>
                    )}
                    
                    {/* Delete button for active users */}
                    {u.isActive && currentUser?.id !== u.id && u.role !== 'admin' && (
                        <button
                            onClick={() => handleDelete(u.id)}
                            className="text-error hover:scale-110 transition-transform"
                        >
                            <UserX size={18} />
                        </button>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-background-tertiary to-background-secondary border border-card-border flex items-center justify-center font-bold text-text-primary text-xl shadow-inner">
                        {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-primary truncate">{u.firstName} {u.lastName}</h4>
                        <div className="flex items-center text-text-muted text-xs mt-1">
                            <Mail size={12} className="mr-1" />
                            <span className="truncate">{u.email}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-tighter">
                            {u.isActive ? (
                                <>
                                    <Shield size={10} className="mr-1 text-brand-green" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <UserX size={10} className="mr-1 text-text-muted" />
                                    Inactive
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        ));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Personnel Directory</h2>
                    <p className="text-text-secondary text-sm">Administrative control over system access and role assignments.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} className="mr-2" />
                    Onboard Personnel
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listContent}
                {users.length === 0 && !loading && <div className="col-span-full py-10 text-center text-text-muted">No personnel identified in records.</div>}
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />
            
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal user={users.find(u => u.id === deleteConfirmation)} onCancel={cancelDelete} onConfirm={confirmDelete} />
            )}
        </div>
    );
};

const DeleteConfirmationModal = ({ user, onCancel, onConfirm }) => {
    if (!user) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-primary/80 backdrop-blur-sm transition-opacity" onClick={onCancel} />
            <div className="relative bg-background-secondary border border-card-border w-full max-w-md rounded-2xl shadow-2xl">
                <div className="p-8">
                    <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                            <UserX className="w-7 h-7 text-error" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-text-primary mb-3">Deactivate User</h3>
                            <p className="text-text-muted leading-relaxed">
                                Are you sure you want to deactivate 
                                <span className="font-semibold text-text-primary"> {user.firstName} {user.lastName}</span>?
                                <br />
                                <span className="text-sm">This action can be reversed later.</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-card-border">
                        <Button variant="ghost" onClick={onCancel} className="px-6">
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={onConfirm} className="px-6">
                            Deactivate
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
