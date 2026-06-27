import axios from 'axios';

const API_BASE = 'http://localhost:5043/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Employees
export const getEmployees = () => api.get('/employee');
export const getEmployee = (id) => api.get(`/employee/${id}`);
export const searchEmployees = (term) => api.get(`/employee/search?term=${encodeURIComponent(term)}`);
export const createEmployee = (data) => api.post('/employee', data);
export const updateEmployee = (id, data) => api.put(`/employee/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employee/${id}`);

// Departments
export const getDepartments = () => api.get('/department');

export default api;
