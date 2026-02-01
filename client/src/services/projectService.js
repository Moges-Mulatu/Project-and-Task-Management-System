import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

// Helper to get token from storage
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
});

export const getProjects = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const createProject = async (projectData) => {
  // projectData includes: name, description, startDate, endDate, teamId [cite: 74]
  const response = await axios.post(API_URL, projectData, getAuthHeader());
  return response.data;
};