import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Helper to check roles easily
  const isAdmin = context.user?.role === 'admin';
  const isPM = context.user?.role === 'project_manager';
  const isMember = context.user?.role === 'team_member';

  return { ...context, isAdmin, isPM, isMember };
};