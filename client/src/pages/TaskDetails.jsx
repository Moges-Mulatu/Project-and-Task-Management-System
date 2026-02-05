import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const taskRes = await apiService.getTask(id);
        const taskData = taskRes.data;
        setTask(taskData);

        // Fetch project and comments in parallel
        const [projectRes, commentsRes] = await Promise.all([
          apiService.getProject(taskData.projectId),
          apiService.getTaskComments(id).catch(() => ({ data: [] })) // Fallback if no comments endpoint
        ]);

        setProject(projectRes.data);
        setComments(commentsRes.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
      case 'not started':
        return 'bg-gray-100 text-gray-800';
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await apiService.addComment(id, { content: newComment });
      if (response.success) {
        setComments([...comments, response.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSubmittingStatus(true);
      const response = await apiService.updateTask(id, { status: newStatus });
      if (response.success) {
        setTask({ ...task, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const toggleSubtask = async (subtaskId) => {
    try {
      await apiService.toggleSubtask(id, subtaskId);
      setTask({
        ...task,
        Subtasks: task.Subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
      });
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8 text-center bg-card-background rounded-xl border border-card-border">
        <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
        <p className="text-text-secondary mb-6">{error || 'Task not found'}</p>
        <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/tasks')} className="border-card-border">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-brand-green bg-clip-text text-transparent">
            {task.title}
          </h1>
        </div>
        <div className="flex gap-2">
          {permissions?.canEditTasks && (
            <Button variant="outline" className="border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10">
              Edit Task
            </Button>
          )}
          {permissions?.canDeleteTasks && (
            <Button variant="danger" onClick={handleDeleteTask}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-card-border/50">
            <Card.Body className="p-8">
              <div className="mb-8">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Description</h3>
                <p className="text-text-secondary leading-relaxed bg-background-secondary/20 p-4 rounded-xl border border-card-border/30">
                  {task.description || 'No description provided for this task.'}
                </p>
              </div>

              {task.Subtasks && task.Subtasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Subtasks</h3>
                  <div className="space-y-2">
                    {task.Subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-4 bg-background-secondary/30 rounded-xl border border-white/5 hover:border-brand-blue/30 transition-all duration-200">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => toggleSubtask(subtask.id)}
                          className="h-5 w-5 bg-card-background border-card-border rounded text-brand-blue focus:ring-brand-blue"
                        />
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="border-card-border/50 overflow-hidden">
            <Card.Header className="bg-background-secondary/30 border-b border-card-border p-6 font-bold text-text-primary flex items-center justify-between">
              <span>Comments</span>
              <span className="px-2 py-0.5 bg-card-background rounded-full text-xs font-medium text-text-muted border border-card-border">
                {comments.length}
              </span>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gradient-to-br from-brand-blue to-brand-green text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                          {(comment.User?.firstName?.[0] || 'U') + (comment.User?.lastName?.[0] || '')}
                        </div>
                      </div>
                      <div className="flex-1 bg-background-secondary/30 p-4 rounded-2xl border border-white/5 relative group-hover:border-brand-blue/20 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-text-primary">
                            {comment.User ? `${comment.User.firstName} ${comment.User.lastName}` : 'System User'}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-text-muted tracking-tighter">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 flex flex-col items-center">
                    <div className="h-12 w-12 bg-background-tertiary rounded-full flex items-center justify-center mb-4 text-text-muted">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-text-muted text-sm font-medium">No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-background-secondary/50 border-t border-card-border">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-card-background border border-card-border rounded-xl flex items-center justify-center text-sm font-bold text-text-muted">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts or update the team..."
                      rows={3}
                      className="w-full px-4 py-3 bg-card-background border border-card-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200 text-sm"
                    />
                    <div className="mt-3 flex justify-end">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()} className="px-6">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-card-border/50">
            <Card.Body className="p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Task Statistics</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Current Status</p>
                  <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded-full ${getStatusColor(task.status)} uppercase tracking-wider`}>
                    {task.status || 'todo'}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Priority Level</p>
                  <span className={`inline-flex px-3 py-1 text-[10px] font-bold rounded-full ${getPriorityColor(task.priority)} uppercase tracking-wider`}>
                    {task.priority || 'medium'}
                  </span>
                </div>

                <div className="pt-4 border-t border-card-border/50">
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Linked Project</p>
                  <p className="text-sm font-bold text-text-primary truncate">{project?.name || 'Global Task'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Assignee</p>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue mr-2">
                      {task.Assignee ? task.Assignee.firstName[0] : '?'}
                    </div>
                    <p className="text-sm font-medium text-text-secondary">
                      {task.Assignee ? `${task.Assignee.firstName} ${task.Assignee.lastName}` : 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Due Date</p>
                  <div className="flex items-center text-sm font-medium text-text-secondary">
                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>
              </div>

              {permissions?.canEditTasks && (
                <div className="mt-8 pt-6 border-t border-card-border/50">
                  <label className="text-[10px] font-bold text-text-muted uppercase mb-3 block">
                    Fast Status Switch
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={submittingStatus}
                    className="w-full px-4 py-2 bg-card-background border border-card-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  >
                    <option value="Todo">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="border-card-border/50">
            <Card.Header className="bg-background-secondary/30 border-b border-card-border p-4 font-bold text-xs text-text-muted uppercase">
              System Info
            </Card.Header>
            <Card.Body className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Created By</p>
                <p className="text-xs font-medium text-text-secondary">
                  {task.Creator ? `${task.Creator.firstName} ${task.Creator.lastName}` : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Created Date</p>
                <p className="text-xs font-medium text-text-secondary">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Last Updated</p>
                <p className="text-xs font-medium text-text-secondary">
                  {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
