import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  EmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  DepartmentDto,
  CreateDepartmentDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/auth/login', data);

export const register = (data: RegisterRequest) =>
  api.post('/auth/register', data);

// Employees
export const getEmployees = () => api.get<EmployeeDto[]>('/employee');

export const getEmployee = (id: number) =>
  api.get<EmployeeDto>(`/employee/${id}`);

export const searchEmployees = (term: string) =>
  api.get<EmployeeDto[]>(`/employee/search?term=${encodeURIComponent(term)}`);

export const getEmployeesByDepartment = (departmentId: number) =>
  api.get<EmployeeDto[]>(`/employee/department/${departmentId}`);

export const createEmployee = (data: CreateEmployeeDto) =>
  api.post<EmployeeDto>('/employee', data);

export const updateEmployee = (id: number, data: UpdateEmployeeDto) =>
  api.put<EmployeeDto>(`/employee/${id}`, data);

export const deleteEmployee = (id: number) =>
  api.delete(`/employee/${id}`);

// Departments
export const getDepartments = () => api.get<DepartmentDto[]>('/department');

export const getDepartment = (id: number) =>
  api.get<DepartmentDto>(`/department/${id}`);

export const createDepartment = (data: CreateDepartmentDto) =>
  api.post<DepartmentDto>('/department', data);

export default api;
