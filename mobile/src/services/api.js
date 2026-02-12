import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5000/api/v1";

const TOKEN_KEY = "debo_auth_token";
const USER_KEY = "debo_auth_user";

const saveAuth = async ({ token, user }) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

const loadAuth = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const user = await AsyncStorage.getItem(USER_KEY);
  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

const clearAuth = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

const request = async (path, options = {}) => {
  const auth = await loadAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add auth token if available
  if (auth.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // If rate limited, show friendly message
      if (response.status === 429) {
        throw new Error(data.message || "Too many attempts. Please try again later.");
      }
      // If unauthorized, token might be expired - clear it
      if (response.status === 401) {
        console.log("Auth failed - token may be expired");
      }
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error.message === "Network request failed") {
      throw new Error("Cannot connect to server. Check your connection.");
    }
    throw error;
  }
};

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value);
  if (!entries.length) return "";
  const search = new URLSearchParams(entries).toString();
  return `?${search}`;
};

const api = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getProfile: () => request("/users/me"),
  updateProfile: (payload) =>
    request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getProjects: () => request("/projects"),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (payload) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: "DELETE",
    }),
  getTasks: (params) => request(`/tasks${buildQuery(params)}`),
  createTask: (payload) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTask: (id, payload) =>
    request(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),
  getTeams: () => request("/teams"),
  getTeamMembers: (teamId) => request(`/teams/${teamId}/members`),
  createTeam: (payload) =>
    request("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteTeam: (id) =>
    request(`/teams/${id}`, {
      method: "DELETE",
    }),
  addTeamMember: (teamId, payload) =>
    request(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  // Reports
  getReports: (params) => request(`/reports${buildQuery(params)}`),
  getReport: (id) => request(`/reports/${id}`),
  createReport: (payload) =>
    request("/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteReport: (id) =>
    request(`/reports/${id}`, {
      method: "DELETE",
    }),
  generateProjectSummary: (projectId) =>
    request(`/reports/projects/${projectId}/summary`, {
      method: "POST",
    }),

  // Users
  getUsers: (params) => request(`/users${buildQuery(params)}`),
  createUser: (payload) =>
    request("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUser: (id) => request(`/users/${id}`),
  searchUsers: (query) => request(`/users/search${buildQuery({ q: query })}`),
  deactivateUser: (id) =>
    request(`/users/${id}`, {
      method: "DELETE",
    }),
  // Admin-only: Update user role
  updateUserRole: (id, role) =>
    request(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  // Admin-only: Reactivate user
  reactivateUser: (id) =>
    request(`/users/${id}/reactivate`, {
      method: "PATCH",
    }),

  // System stats (dashboard counts)
  getSystemStats: () => request("/system-stats"),
};

export { API_BASE_URL, api, saveAuth, loadAuth, clearAuth };
