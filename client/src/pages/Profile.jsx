import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        // Simulate API update
        setIsEditing(false);
        alert('Profile updated successfully! (Demo mode)');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
                    My Profile
                </h1>
                <p className="mt-1 text-sm text-text-secondary">View and manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1 border-card-border/50 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-brand-blue to-brand-green w-full"></div>
                    <Card.Body className="p-6 -mt-12 text-center">
                        <div className="h-24 w-24 rounded-2xl bg-card-background border-4 border-card-background shadow-xl mx-auto flex items-center justify-center text-3xl font-bold text-brand-blue bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-md mb-4">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <h2 className="text-xl font-bold text-text-primary capitalize">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-sm text-text-muted mb-6 uppercase font-bold tracking-widest">{user?.role?.replace('_', ' ')}</p>

                        <div className="space-y-3 pt-6 border-t border-card-border/30">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Account Status</span>
                                <span className="text-brand-green font-bold uppercase text-[10px]">Verified</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Joined</span>
                                <span className="text-text-primary">Jan 2026</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Details Form */}
                <Card className="lg:col-span-2">
                    <Card.Header className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-text-primary">Personal details</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </Button>
                    </Card.Header>
                    <Card.Body className="p-8">
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-xl text-sm transition-all duration-200 border ${isEditing
                                                ? 'bg-background-tertiary border-brand-blue/50 text-text-primary focus:ring-2 focus:ring-brand-blue/20'
                                                : 'bg-background-secondary/20 border-card-border/50 text-text-secondary cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2 tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-xl text-sm transition-all duration-200 border ${isEditing
                                                ? 'bg-background-tertiary border-brand-blue/50 text-text-primary focus:ring-2 focus:ring-brand-blue/20'
                                                : 'bg-background-secondary/20 border-card-border/50 text-text-secondary cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2 tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    disabled={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-xl text-sm transition-all duration-200 border ${isEditing
                                            ? 'bg-background-tertiary border-brand-blue/50 text-text-primary focus:ring-2 focus:ring-brand-blue/20'
                                            : 'bg-background-secondary/20 border-card-border/50 text-text-secondary cursor-not-allowed'
                                        }`}
                                />
                            </div>

                            {isEditing && (
                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" className="px-8 shadow-lg shadow-brand-blue/20">
                                        Update Information
                                    </Button>
                                </div>
                            )}
                        </form>

                        <div className="mt-12 pt-12 border-t border-card-border/50 space-y-6">
                            <h4 className="text-sm font-bold text-text-primary uppercase tracking-tighter italic">Security Settings</h4>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button variant="outline" className="flex-1 border-card-border">Change Password</Button>
                                <Button variant="outline" className="flex-1 border-card-border">Setup 2FA</Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
