import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Adjust based on your backend port

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};