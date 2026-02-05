import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';

import CreateProjectModal from '../components/modals/CreateProjectModal';
import CreateTaskModal from '../components/modals/CreateTaskModal';

const Dashboard = () => {
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [data, setData] = useState({
    projects: [],
    tasks: [],
    users: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        apiService.getProjects(),
        apiService.getAllTasks(),
        apiService.getUsers()
      ]);

      setData({
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        users: usersRes.data || []
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Projects',
      value: data.projects.length.toString(),
      change: 'Real-time data',
      changeType: 'neutral'
    },
    {
      name: 'Active Tasks',
      value: data.tasks.filter(t => t.status !== 'Completed').length.toString(),
      change: 'In progress',
      changeType: 'positive'
    },
    {
      name: 'Completed Tasks',
      value: data.tasks.filter(t => t.status === 'Completed').length.toString(),
      change: 'Total finished',
      changeType: 'positive'
    },
    {
      name: 'Team Members',
      value: data.users.length.toString(),
      change: 'Active users',
      changeType: 'neutral'
    }
  ];

  const recentTasks = data.tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return {
          title: 'Admin Dashboard',
          description: 'Manage all projects, tasks, and users',
          canCreateProjects: true,
          canManageUsers: true
        };
      case ROLES.PROJECT_MANAGER:
        return {
          title: 'Project Manager Dashboard',
          description: 'Oversee projects and assign tasks',
          canCreateProjects: true,
          canManageUsers: false
        };
      case ROLES.TEAM_MEMBER:
        return {
          title: 'Team Member Dashboard',
          description: 'View your assigned tasks and progress',
          canCreateProjects: false,
          canManageUsers: false
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to the task management system',
          canCreateProjects: false,
          canManageUsers: false
        };
    }
  };

  const roleContent = getRoleBasedContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">{roleContent.title}</h1>
        <p className="mt-2 text-text-secondary">{roleContent.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.name} className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card.Body className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-text-secondary">{stat.name}</p>
                <div className={`h - 2 w - 2 rounded - full ${index === 0 ? 'bg-brand-blue' :
                    index === 1 ? 'bg-brand-green' :
                      index === 2 ? 'bg-brand-green-light' :
                        'bg-brand-blue-light'
                  } animate - pulse`}></div>
              </div>
              <p className="mt-2 text-3xl font-bold text-text-primary">{stat.value}</p>
              <p className={`mt - 2 text - sm font - medium flex items - center ${stat.changeType === 'positive' ? 'text-brand-green' :
                  stat.changeType === 'negative' ? 'text-error' :
                    'text-text-muted'
                } `}>
                {stat.changeType === 'positive' && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {stat.change}
              </p>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="hover:shadow-card-lg transition-all duration-300">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Recent Tasks</h3>
              <div className="h-2 w-2 bg-brand-green rounded-full animate-pulse"></div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => {
                  const project = data.projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-card-background/50 rounded-lg border border-card-border/50 hover:bg-card-background transition-colors duration-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{task.title}</p>
                        <p className="text-xs text-text-muted mt-1">{project?.name || 'No Project'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline - flex px - 3 py - 1 text - xs font - semibold rounded - full ${task.priority === 'high' ? 'bg-error/20 text-error' :
                            task.priority === 'medium' ? 'bg-warning/20 text-warning' :
                              'bg-text-muted/20 text-text-muted'
                          } capitalize`}>
                          {task.priority || 'low'}
                        </span>
                        <p className="text-xs text-text-muted mt-2 capitalize">{task.status}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-4 text-text-secondary">No recent tasks found.</p>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-card-lg transition-all duration-300">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
              <div className="h-2 w-2 bg-brand-blue rounded-full animate-pulse"></div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {permissions?.canCreateProjects && (
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-brand-blue/10 to-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-lg hover:from-brand-blue/20 hover:to-brand-blue/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Create New Project</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}
              {permissions?.canCreateTasks && (
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-brand-green/10 to-brand-green/20 text-brand-green border border-brand-green/30 rounded-lg hover:from-brand-green/20 hover:to-brand-green/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Create New Task</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}
              <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-500/10 to-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:from-purple-500/20 hover:to-purple-500/30 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="font-medium">View All Projects</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-orange-500/10 to-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:from-orange-500/20 hover:to-orange-500/30 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="font-medium">View My Tasks</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>

      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSuccess={fetchDashboardData}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
