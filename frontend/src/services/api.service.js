// Default API URL points to backend server. Change VITE_API_URL in .env when needed.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('debo_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            const result = await response.json().catch(() => null);
            console.log(`📡 API Response [${endpoint}]:`, result);

            // Centralized 401 handling: clear token and redirect to login
            if (response.status === 401) {
                try {
                    localStorage.removeItem('debo_token');
                    localStorage.removeItem('debo_user');
                } finally {
                    window.location.href = '/login';
                }
            }

            if (!response.ok) {
                const message = (result && result.message) || response.statusText || 'API request failed';
                const err = new Error(message);
                err.status = response.status;
                throw err;
            }

            return result;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    }

    // Auth
    login(credentials) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); }
    register(data) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }

    // Projects
    getProjects(filters = '') { return this.request(`/projects${filters}`); }
    getProject(id) { return this.request(`/projects/${id}`); }
    createProject(data) { return this.request('/projects', { method: 'POST', body: JSON.stringify(data) }); }
    updateProject(id, data) { return this.request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
    deleteProject(id) { return this.request(`/projects/${id}`, { method: 'DELETE' }); }

    // Tasks
    getTasks(filters = '') { return this.request(`/tasks${filters}`); }
    getTask(id) { return this.request(`/tasks/${id}`); }
    createTask(data) { return this.request('/tasks', { method: 'POST', body: JSON.stringify(data) }); }
    updateTask(id, data) { return this.request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
    deleteTask(id) { return this.request(`/tasks/${id}`, { method: 'DELETE' }); }

    // Users, Teams & Reports
    getUsers() { return this.request('/users'); }
    createUser(data) { return this.request('/users', { method: 'POST', body: JSON.stringify(data) }); }
    deleteUser(id) { return this.request(`/users/${id}`, { method: 'DELETE' }); }
    getProfile() { return this.request('/users/me'); }
    updateProfile(data) { return this.request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }); }
    getTeams() { return this.request('/teams'); }
    getTeam(id) { return this.request(`/teams/${id}`); }
    updateTeam(id, data) { return this.request(`/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
    deleteTeam(id) { return this.request(`/teams/${id}`, { method: 'DELETE' }); }
    getTeamMembers(teamId) { return this.request(`/teams/${teamId}/members`); }
    addTeamMember(teamId, userId) { return this.request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }); }
    removeTeamMember(teamId, userId) { return this.request(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' }); }
    getReports() { return this.request('/reports'); }
    createTeam(data) { return this.request('/teams', { method: 'POST', body: JSON.stringify(data) }); }
}

export const api = new ApiService();
