import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants';
import {
    LayoutDashboard,
    Briefcase,
    CheckSquare,
    Users,
    Network,
    BarChart3,
    UserCircle,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, roles }) => {
    const { user } = useAuth();
    if (roles && !roles.includes(user?.role)) return null;

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-brand-green text-white shadow-glow'
                    : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                }`
            }
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER] },
        { to: '/projects', icon: Briefcase, label: 'Projects', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
        { to: '/tasks', icon: CheckSquare, label: 'My Tasks', roles: [ROLES.TEAM_MEMBER, ROLES.PROJECT_MANAGER] },
        { to: '/teams', icon: Network, label: 'Teams', roles: [ROLES.ADMIN] },
        { to: '/users', icon: Users, label: 'Users', roles: [ROLES.ADMIN] },
        { to: '/reports', icon: BarChart3, label: 'Reports', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
        { to: '/profile', icon: UserCircle, label: 'Profile' },
    ];

    return (
        <div className="flex h-screen bg-background-primary overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-background-secondary border-r border-card-border p-4 h-full sticky top-0 flex-shrink-0">
                <div className="flex items-center space-x-3 px-2 mb-10">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                            src="/src/assets/Debo Engineering logo.jpg" 
                            alt="Debo Engineering Logo" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-primary leading-tight">Debo</h1>
                        <p className="text-xs text-brand-green font-bold tracking-widest uppercase">Engineering</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navigation.map((item) => (
                        <SidebarItem key={item.to} {...item} />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-card-border">
                    <div className="flex items-center space-x-3 px-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-background-tertiary border border-card-border flex items-center justify-center font-bold text-brand-green">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-primary truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-text-muted truncate capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-error hover:bg-error/10 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-background-secondary border-b border-card-border">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img 
                                src="/src/assets/Debo Engineering logo.jpg" 
                                alt="Debo Logo" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="font-bold text-text-primary">Debo</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text-secondary">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-background-primary/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <aside className="w-64 h-full bg-background-secondary p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Mobile Sidebar Content (similar to desktop) */}
                        <div className="mt-10 space-y-2">
                            {navigation.map((item) => (
                                <SidebarItem key={item.to} {...item} />
                            ))}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Layout;
