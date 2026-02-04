import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Projects = () => {
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [showCreateModal, setShowCreateModal] = useState(false);

  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      status: 'In Progress',
      progress: 65,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      deadline: '2024-03-15',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      status: 'Planning',
      progress: 20,
      team: ['Sarah Wilson', 'Tom Brown'],
      deadline: '2024-06-30',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      status: 'In Progress',
      progress: 80,
      team: ['Alex Chen', 'Lisa Anderson'],
      deadline: '2024-02-28',
      priority: 'High'
    },
    {
      id: 4,
      name: 'API Documentation',
      description: 'Create comprehensive documentation for REST API',
      status: 'Completed',
      progress: 100,
      team: ['David Lee'],
      deadline: '2024-01-31',
      priority: 'Low'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and track all projects</p>
        </div>
        {permissions?.canCreateProjects && (
          <Button onClick={() => setShowCreateModal(true)}>
            Create Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <Card.Body>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Team Members:</p>
                <div className="flex flex-wrap gap-1">
                  {project.team.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Deadline: {project.deadline}</span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <Card.Body className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
            {permissions?.canCreateProjects && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Project
              </Button>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Projects;
