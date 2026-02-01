import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Get auth token from local storage
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
});

export const getTasksByProject = async (projectId) => {
  const response = await axios.get(`${API_URL}/project/${projectId}`, getAuthHeader());
  return response.data;
};

export const createTask = async (taskData) => {
  // Includes title, description, assigneeId, deadline, status [cite: 85-91]
  const response = await axios.post(API_URL, taskData, getAuthHeader());
  return response.data;
};

export const updateTaskProgress = async (taskId, progressPercentage, status) => {
  // Team members update progress and status [cite: 57, 58, 92]
  const response = await axios.patch(`${API_URL}/${taskId}`, { 
    progressPercentage, 
    status 
  }, getAuthHeader());
  return response.data;
};