import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Mail, Shield, Smartphone, Briefcase, Building, Save, Camera } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.getProfile();
                setProfile(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { firstName, lastName, phone, department, position } = profile;
            await api.updateProfile({ firstName, lastName, phone, department, position });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-background-tertiary border-2 border-brand-green/20 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-brand-green" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{profile?.firstName} {profile?.lastName}</h1>
                        <p className="text-text-muted flex items-center mt-1">
                            <Shield size={14} className="mr-2 text-brand-green" />
                            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">{profile?.role?.replace('_', ' ')}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Information Glance */}
                <Card className="md:col-span-1 h-fit">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 border-b border-card-border pb-4">Personal Identifiers</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-background-tertiary rounded-lg text-brand-green">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-text-muted uppercase font-bold">Email Registry</p>
                                <p className="text-sm font-medium text-text-primary">{profile?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-background-tertiary rounded-lg text-info">
                                <Building size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] text-text-muted uppercase font-bold">Department</p>
                                <p className="text-sm font-medium text-text-primary">{profile?.department || 'Operations'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Edit Form */}
                <Card className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Registry Configuration</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">First Name</label>
                                <input
                                    type="text"
                                    value={profile?.firstName || ''}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Last Name</label>
                                <input
                                    type="text"
                                    value={profile?.lastName || ''}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                                    <Smartphone size={10} className="mr-1" /> Mobile Number
                                </label>
                                <input
                                    type="text"
                                    value={profile?.phone || ''}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                                    <Briefcase size={10} className="mr-1" /> Position
                                </label>
                                <input
                                    type="text"
                                    value={profile?.position || ''}
                                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl px-4 py-3 text-sm focus:border-brand-green outline-none transition-colors"
                                    placeholder="Lead Architect"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-xs font-medium border ${message.type === 'success'
                                    ? 'bg-brand-green/10 border-brand-green/20 text-brand-green'
                                    : 'bg-error/10 border-error/20 text-error'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" variant="primary" loading={saving}>
                                <Save size={18} className="mr-2" />
                                Commit Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
