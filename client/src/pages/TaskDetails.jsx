import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = ROLE_PERMISSIONS[user?.role];
  const [newComment, setNewComment] = useState('');

  const task = {
    id: id,
    title: 'Design new landing page',
    description: 'Create mockups and wireframes for the new landing page design. The design should be modern, responsive, and follow our brand guidelines.',
    status: 'In Progress',
    priority: 'High',
    project: 'Website Redesign',
    assignee: 'John Doe',
    creator: 'Jane Smith',
    dueDate: '2024-02-15',
    createdAt: '2024-01-28',
    updatedAt: '2024-01-30',
    tags: ['Design', 'Frontend', 'UI/UX'],
    attachments: [
      { name: 'landing-page-mockup.fig', size: '2.4 MB', type: 'Figma File' },
      { name: 'design-guidelines.pdf', size: '1.2 MB', type: 'PDF' }
    ],
    comments: [
      {
        id: 1,
        author: 'Jane Smith',
        content: 'Please make sure to follow the brand guidelines we discussed in the last meeting.',
        createdAt: '2024-01-29',
        avatar: 'JS'
      },
      {
        id: 2,
        author: 'John Doe',
        content: 'I\'ve started working on the initial mockups. Should have something to share by tomorrow.',
        createdAt: '2024-01-30',
        avatar: 'JD'
      }
    ],
    subtasks: [
      { id: 1, title: 'Research competitor designs', completed: true },
      { id: 2, title: 'Create wireframes', completed: true },
      { id: 3, title: 'Design high-fidelity mockups', completed: false },
      { id: 4, title: 'Get stakeholder approval', completed: false }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Todo':
        return 'bg-gray-100 text-gray-800';
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleStatusChange = (newStatus) => {
    console.log('Changing status to:', newStatus);
  };

  const toggleSubtask = (subtaskId) => {
    console.log('Toggling subtask:', subtaskId);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/tasks')}>
            ← Back to Tasks
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>
        <div className="flex gap-2">
          {permissions?.canEditTasks && (
            <Button variant="outline">
              Edit Task
            </Button>
          )}
          {permissions?.canDeleteTasks && (
            <Button variant="danger">
              Delete Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Body>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{task.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subtasks</h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Comments</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4 mb-6">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {comment.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Body>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.project}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Assignee</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.assignee}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.creator}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.dueDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.createdAt}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{task.updatedAt}</p>
                </div>
              </div>

              {permissions?.canEditTasks && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
