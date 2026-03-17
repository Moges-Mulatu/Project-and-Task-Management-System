import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(formData);
            if (response.success) {
                login(response.data.user, response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/30 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue/30 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-32 h-32 mb-6 flex items-center justify-center">
                        <img 
                            src="/src/assets/Debo Engineering logo.jpg" 
                            alt="Debo Engineering Logo" 
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Debo Engineering</h1>
                    <p className="text-brand-green font-bold tracking-[0.3em] uppercase text-xs mt-2">In Pursuit of Service</p>
                </div>

                <Card className="shadow-2xl border-card-border/50 backdrop-blur-md bg-card-background/80">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@deboengineering.com"
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary focus:ring-2 focus:ring-brand-green/50 outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-background-tertiary border border-card-border rounded-xl py-2.5 pl-11 pr-4 text-text-primary focus:ring-2 focus:ring-brand-green/50 outline-none transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm animate-pulse">
                                <ShieldAlert size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-3.5 rounded-xl font-bold text-base mt-2"
                            loading={loading}
                            variant="primary"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Identify & Sign In
                        </Button>
                    </form>
                </Card>

            </div>
        </div>
    );
};

export default Login;
