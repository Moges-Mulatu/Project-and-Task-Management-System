import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UserPlus, Shield, UserX, Mail } from 'lucide-react';
import CreateUserModal from '../../components/modals/CreateUserModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useToast } from '../../hooks/useToast.jsx';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const { success, error, ToastContainer } = useToast();

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
        setDeletingUserId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.deleteUser(deletingUserId);
            success('User deactivated successfully');
            fetchUsers();
        } catch (err) {
            error(err.message || 'Failed to deactivate user');
        } finally {
            setDeletingUserId(null);
        }
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
                    {/* Prevent deleting admins or yourself */}
                    {currentUser?.id !== u.id && u.role !== 'admin' && (
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
                    <div className="flex items-center text-[10px] font-bold text-brand-green uppercase tracking-tighter">
                        <Shield size={10} className="mr-1" />
                        Verified Access
                    </div>
                </div>
            </Card>
        ));

    return (
        <>
            <ToastContainer />
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

                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Deactivate User"
                    message="Are you sure you want to deactivate this user? They will no longer have access to the system."
                    confirmText="Deactivate User"
                    type="danger"
                />
            </div>
        </>
    );
};

export default Users;
