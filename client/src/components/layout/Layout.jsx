import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import Button from '../ui/Button';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER] },
    { name: 'Projects', href: '/projects', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
    { name: 'Tasks', href: '/tasks', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER] },
    { name: 'Teams', href: '/teams', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
    { name: 'Users', href: '/users', roles: [ROLES.ADMIN] },
    { name: 'Reports', href: '/reports', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER] },
    { name: 'Profile', href: '/profile', roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-background-primary">
      <nav className="bg-gradient-to-r from-background-secondary via-background-secondary to-brand-green/10 backdrop-blur-md shadow-lg border-b border-card-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg mr-3 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">Project & Task Manager</h1>
              </div>
              <div className="hidden sm:flex sm:space-x-1">
                {filteredNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary hover:bg-card-background/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.name}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-green rounded-lg opacity-20 blur-sm"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-card-background/50 rounded-lg border border-card-border/50">
                <div className="h-2 w-2 bg-brand-green rounded-full animate-pulse"></div>
                <span className="text-sm text-text-secondary">
                  {user?.name} <span className="text-text-muted">({user?.role})</span>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-brand-green/30 text-brand-green hover:bg-brand-green/10 hover:border-brand-green/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
