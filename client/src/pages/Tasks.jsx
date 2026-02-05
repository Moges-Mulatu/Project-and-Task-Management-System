import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import EditTaskModal from '../components/modals/EditTaskModal';

const Tasks = () => {
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        apiService.getAllTasks(),
        apiService.getProjects(),
        apiService.getUsers()
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteTask(id);
        fetchTasksData();
      } catch (err) {
        console.error('Failed to delete task:', err);
        alert('Failed to delete task.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'in progress':
        return 'bg-primary-500/20 text-primary-300';
      case 'todo':
      case 'not started':
        return 'bg-text-muted/20 text-text-muted';
      case 'on hold':
        return 'bg-error/20 text-error';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-text-muted/20 text-text-muted';
      default:
        return 'bg-text-muted/20 text-text-muted';
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

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status?.toLowerCase() === filter.toLowerCase();
    const projectName = projects.find(p => p.id === task.projectId)?.name || '';
    const assigneeName = users.find(u => u.id === task.assignedTo)?.firstName + ' ' + (users.find(u => u.id === task.assignedTo)?.lastName || '') || 'Unassigned';

    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assigneeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status?.toLowerCase() === 'todo' || t.status?.toLowerCase() === 'not started').length,
    inProgress: tasks.filter(t => t.status?.toLowerCase() === 'in progress').length,
    completed: tasks.filter(t => t.status?.toLowerCase() === 'completed').length
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
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">Tasks</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage and track all individual tasks</p>
        </div>
        {permissions?.canCreateTasks && (
          <Button onClick={() => setShowCreateModal(true)}>
            Create Task
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Tasks', value: taskStats.total, color: 'text-text-primary' },
          { label: 'To Do', value: taskStats.todo, color: 'text-text-muted' },
          { label: 'In Progress', value: taskStats.inProgress, color: 'text-primary-400' },
          { label: 'Completed', value: taskStats.completed, color: 'text-success' }
        ].map((stat) => (
          <Card key={stat.label}>
            <Card.Body>
              <p className="text-sm font-medium text-text-secondary mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-card-border/50">
        <Card.Body className="p-0">
          <div className="p-6 bg-background-secondary/30 border-b border-card-border flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-text-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by title, project, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card-background border border-card-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'todo', 'in progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 whitespace-nowrap ${filter === status
                    ? 'bg-brand-blue text-white border-brand-blue shadow-glow-sm'
                    : 'bg-card-background text-text-secondary border-card-border hover:border-brand-blue/50'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border">
              <thead className="bg-background-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Task Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card-background divide-y divide-card-border">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const assignee = users.find(u => u.id === task.assignedTo);
                    return (
                      <tr key={task.id} className="hover:bg-card-hover/30 transition-colors duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs overflow-hidden">
                            <div className="text-sm font-medium text-text-primary truncate">{task.title}</div>
                            <div className="text-xs text-text-muted truncate mt-0.5">{task.description || 'No description'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {project?.name || <span className="text-text-muted italic">No Project</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-[10px] font-bold text-white mr-2">
                              {assignee ? `${assignee.firstName[0]}${assignee.lastName[0]}` : '?'}
                            </div>
                            <span className="text-sm text-text-secondary">
                              {assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${getPriorityColor(task.priority)} uppercase tracking-wider`}>
                            {task.priority || 'low'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${getStatusColor(task.status)} uppercase tracking-wider`}>
                            {task.status || 'todo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted font-medium">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                              onClick={() => handleEditClick(task)}
                            >
                              Edit
                            </Button>
                            {permissions?.canDeleteTasks && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-error/30 text-error hover:bg-error/10"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-brand-green/30 text-brand-green hover:bg-brand-green/10"
                              onClick={() => window.location.href = `/tasks/${task.id}`}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 bg-background-tertiary rounded-full flex items-center justify-center mb-4">
                          <svg className="h-6 w-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-base font-medium text-text-primary">No tasks found</h3>
                        <p className="text-sm text-text-secondary mt-1">Try changing your filters or search keywords.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTasksData}
      />

      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchTasksData}
        task={selectedTask}
      />
    </div>
  );
};

export default Tasks;
