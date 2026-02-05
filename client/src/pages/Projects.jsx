import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import EditProjectModal from '../components/modals/EditProjectModal';

const Projects = () => {
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await apiService.deleteProject(id);
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">Projects</h1>
          <p className="mt-1 text-text-secondary">Manage and track all organizational projects</p>
        </div>
        {permissions?.canCreateProjects && (
          <Button onClick={() => setShowCreateModal(true)}>
            Create Project
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
            <Card.Body>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-text-primary">{project.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)} capitalize`}>
                  {project.priority || 'medium'}
                </span>
              </div>

              <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
                {project.description || 'No description provided.'}
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-text-secondary mb-1">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div
                    className="bg-brand-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)} capitalize`}>
                  {project.status || 'not started'}
                </span>
                {project.Department && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {project.Department.name}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-xs text-text-muted border-t border-card-border pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Due {formatDate(project.endDate)}</span>
                  </div>
                  {permissions?.canEditProjects && (
                    <button
                      onClick={() => handleEditClick(project)}
                      className="text-brand-blue hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  {user?.role === ROLES.ADMIN && (
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-error hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                  onClick={() => window.location.href = `/projects/${project.id}`}
                >
                  Manage
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && !error && (
        <Card>
          <Card.Body className="text-center py-16">
            <div className="mx-auto h-16 w-16 bg-background-tertiary rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">Get started by creating your first project to organize your team's work.</p>
            {permissions?.canCreateProjects && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Project
              </Button>
            )}
          </Card.Body>
        </Card>
      )}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchProjects}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchProjects}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
