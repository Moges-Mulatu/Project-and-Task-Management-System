import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Users = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const permissions = ROLE_PERMISSIONS[currentUser?.role];
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUsers();
            setUsers(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (id === currentUser.id) {
            alert("You cannot delete your own account.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await apiService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                console.error('Failed to delete user:', err);
                alert('Failed to delete user.');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'project_manager':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'team_member':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">View and manage system users and their roles</p>
                </div>
            </div>

            <Card className="border-card-border/50">
                <Card.Body className="p-0">
                    <div className="p-6 border-b border-card-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-background-secondary/10">
                        <div className="relative w-full md:w-96">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search users by name, email or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-card-border rounded-xl bg-card-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/50 sm:text-sm transition-all duration-200"
                            />
                        </div>
                        <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                            Total Users: {filteredUsers.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center text-error border-b border-card-border/50">{error}</div>
                        ) : (
                            <table className="min-w-full divide-y divide-card-border/50">
                                <thead className="bg-background-secondary/20">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border/30">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-background-secondary/10 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-bold shadow-md">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-text-primary">{user.firstName} {user.lastName}</div>
                                                        <div className="text-xs text-text-muted">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getRoleBadgeColor(user.role)} uppercase tracking-wider`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-xs font-medium text-brand-green">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-green mr-2 animate-pulse"></div>
                                                    Active
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {currentUser.role === ROLES.ADMIN && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-error/30 text-error hover:bg-error/10"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={user.id === currentUser.id}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                                                        onClick={() => navigate('/profile')}
                                                    >
                                                        Profile
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-text-muted italic">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Users;
