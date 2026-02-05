const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api/v1';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  }

  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id) {
    return this.get(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.post('/projects', projectData);
  }

  async updateProject(id, projectData) {
    return this.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }

  async getTasks(projectId) {
    return this.get(`/projects/${projectId}/tasks`);
  }

  async getTask(id) {
    return this.get(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.post('/tasks', taskData);
  }

  async updateTask(id, taskData) {
    return this.put(`/tasks/${id}`, taskData);
  }

  async deleteTask(id) {
    return this.delete(`/tasks/${id}`);
  }

  async getTaskComments(taskId) {
    return this.get(`/tasks/${taskId}/comments`);
  }

  async addComment(taskId, commentData) {
    return this.post(`/tasks/${taskId}/comments`, commentData);
  }

  async toggleSubtask(taskId, subtaskId) {
    return this.put(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
  }

  async getAllTasks() {
    return this.get('/tasks');
  }

  async getStats() {
    return this.get('/stats');
  }

  async getUsers() {
    return this.get('/users');
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async getTeams() {
    return this.get('/teams');
  }

  async getTeam(id) {
    return this.get(`/teams/${id}`);
  }

  async createTeam(teamData) {
    return this.post('/teams', teamData);
  }

  async updateTeam(id, teamData) {
    return this.put(`/teams/${id}`, teamData);
  }

  async deleteTeam(id) {
    return this.delete(`/teams/${id}`);
  }

  async getTeamMembers(id) {
    return this.get(`/teams/${id}/members`);
  }

  async addTeamMember(teamId, userId) {
    return this.post(`/teams/${teamId}/members`, { userId });
  }

  async removeTeamMember(teamId, userId) {
    return this.delete(`/teams/${teamId}/members/${userId}`);
  }
}

export const apiService = new ApiService();
