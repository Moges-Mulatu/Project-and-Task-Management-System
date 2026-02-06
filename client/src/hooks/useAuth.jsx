import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Helper to check roles easily
  const isAdmin = context.user?.role === 'Admin';
  const isPM = context.user?.role === 'Project Manager';
  const isMember = context.user?.role === 'Team Member';

  return { ...context, isAdmin, isPM, isMember };
};