import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.getUserTasks = async () => {
  try {
    const response = await api.get('/tasks/user-tasks');
    return response.data.tasks;
  } catch (error) {
    throw error;
  }
};

api.getTasksByType = async (taskTypeId) => {
  try {
    const response = await api.get(`/tasks/type/${taskTypeId}`);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

api.getAllTasks = async () => {
  try {
    const response = await axios.get('/api/tasks/user-tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

api.searchTasks = async (searchTerm) => {
  try {
    const response = await api.get(`/tasks/search`, {
      params: { searchTerm }
    });
    return response.data.tasks;
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
};

export default api; 