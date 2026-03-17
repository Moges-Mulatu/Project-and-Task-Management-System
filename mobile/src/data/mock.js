const mockUser = {
  id: "user-1",
  firstName: "Moges",
  lastName: "Mulatu",
  role: "project_manager",
};

const mockProjects = [
  {
    id: "proj-1",
    name: "Redesign main page",
    status: "active",
    progress: 72,
    team: "UI/UX Team",
  },
  {
    id: "proj-2",
    name: "Task Management Backend",
    status: "planning",
    progress: 18,
    team: "Backend Team",
  },
];

const mockTasks = [
  {
    id: "task-1",
    title: "Create onboarding flow",
    status: "in_progress",
    priority: "high",
    progress: 45,
    dueDate: "2026-02-04",
    assignees: ["ME", "AB"],
  },
  {
    id: "task-2",
    title: "API integration review",
    status: "review",
    priority: "medium",
    progress: 80,
    dueDate: "2026-02-06",
    assignees: ["ME"],
  },
];

const mockTeams = [
  { id: "team-1", name: "Backend Team", members: 6 },
  { id: "team-2", name: "Mobile App Team", members: 4 },
  { id: "team-3", name: "UI/UX Team", members: 3 },
];

const mockReports = [
  { id: "rep-1", type: "project_summary", title: "Weekly Project Summary" },
  { id: "rep-2", type: "team_performance", title: "Team Performance Overview" },
];

export { mockUser, mockProjects, mockTasks, mockTeams, mockReports };
