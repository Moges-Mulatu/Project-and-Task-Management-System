// Calculates overall project progress from a list of tasks [cite: 96]
export const calculateProjectProgress = (tasks) => {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + parseInt(task.progressPercentage || 0), 0);
  return Math.round(total / tasks.length);
};

export const formatApiResponse = (response) => {
  return {
    success: response.status >= 200 && response.status < 300,
    data: response.data,
    message: response.data.message || 'Operation successful'
  };
};