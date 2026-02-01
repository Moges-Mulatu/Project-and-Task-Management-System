import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, isAdmin, isPM } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Project Manager', 'Team Member'] },
    { name: 'Projects', path: '/projects', roles: ['Admin', 'Project Manager'] },
    { name: 'My Tasks', path: '/tasks', roles: ['Team Member'] },
    { name: 'Teams', path: '/teams', roles: ['Admin'] },
    { name: 'Reports', path: '/reports', roles: ['Admin', 'Project Manager'] },
  ];

  return (
    <div className="w-64 min-h-screen bg-brand-blue text-white p-4">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold border-b border-white/20 pb-4">Debo Manager</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition ${
              location.pathname === item.path ? 'bg-brand-green' : 'hover:bg-white/10'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;