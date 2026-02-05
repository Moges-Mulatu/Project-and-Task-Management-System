export const ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_MEMBER: 'team_member'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canViewAllTasks: true,
    canManageUsers: true
  },
  [ROLES.PROJECT_MANAGER]: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canViewAllProjects: true,
    canViewAllTasks: true,
    canManageUsers: false
  },
  [ROLES.TEAM_MEMBER]: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canCreateTasks: false,
    canEditTasks: true,
    canDeleteTasks: false,
    canAssignTasks: false,
    canViewAllProjects: false,
    canViewAllTasks: false,
    canManageUsers: false
  }
};
