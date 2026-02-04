import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Tasks = () => {
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tasks = [
    {
      id: 1,
      title: 'Design new landing page',
      description: 'Create mockups and wireframes for the new landing page design',
      status: 'In Progress',
      priority: 'High',
      project: 'Website Redesign',
      assignee: 'John Doe',
      dueDate: '2024-02-15',
      createdAt: '2024-01-28'
    },
    {
      id: 2,
      title: 'Fix navigation bug',
      description: 'Resolve the navigation menu issue on mobile devices',
      status: 'Todo',
      priority: 'Medium',
      project: 'Bug Fixes',
      assignee: 'Jane Smith',
      dueDate: '2024-02-10',
      createdAt: '2024-01-27'
    },
    {
      id: 3,
      title: 'Update API documentation',
      description: 'Update the REST API documentation with new endpoints',
      status: 'In Progress',
      priority: 'Low',
      project: 'Documentation',
      assignee: 'Mike Johnson',
      dueDate: '2024-03-01',
      createdAt: '2024-01-25'
    },
    {
      id: 4,
      title: 'Code review for PR #234',
      description: 'Review pull request for user authentication feature',
      status: 'Todo',
      priority: 'High',
      project: 'Development',
      assignee: 'Sarah Wilson',
      dueDate: '2024-02-05',
      createdAt: '2024-01-26'
    },
    {
      id: 5,
      title: 'Database optimization',
      description: 'Optimize database queries for better performance',
      status: 'Completed',
      priority: 'Medium',
      project: 'Performance',
      assignee: 'Alex Chen',
      dueDate: '2024-02-01',
      createdAt: '2024-01-20'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-success/20 text-success';
      case 'In Progress':
        return 'bg-primary-500/20 text-primary-300';
      case 'Todo':
        return 'bg-text-muted/20 text-text-muted';
      case 'On Hold':
        return 'bg-error/20 text-error';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-error/20 text-error';
      case 'Medium':
        return 'bg-warning/20 text-warning';
      case 'Low':
        return 'bg-text-muted/20 text-text-muted';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage and track all tasks</p>
        </div>
        {permissions?.canCreateTasks && (
          <Button>
            Create Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">Total Tasks</p>
                <p className="text-2xl font-bold text-text-primary">{taskStats.total}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">To Do</p>
                <p className="text-2xl font-bold text-text-primary">{taskStats.todo}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">In Progress</p>
                <p className="text-2xl font-bold text-primary-400">{taskStats.inProgress}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary">Completed</p>
                <p className="text-2xl font-bold text-success">{taskStats.completed}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Body>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-card-background border border-card-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'todo', 'in progress', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border">
              <thead className="background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card-background divide-y divide-card-border">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-card-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{task.title}</div>
                        <div className="text-sm text-text-muted">{task.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {task.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-text-primary mb-2">No tasks found</h3>
              <p className="text-text-secondary">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Tasks;
