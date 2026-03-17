import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.service';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const savedUser = localStorage.getItem('debo_user');
            const token = localStorage.getItem('debo_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // validate token with backend
                const res = await api.request('/users/me');
                if (res && res.data) {
                    setUser(res.data);
                    localStorage.setItem('debo_user', JSON.stringify(res.data));
                } else if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (err) {
                localStorage.removeItem('debo_token');
                localStorage.removeItem('debo_user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('debo_user', JSON.stringify(userData));
        localStorage.setItem('debo_token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('debo_user');
        localStorage.removeItem('debo_token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
