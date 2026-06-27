export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
}

export interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  maskedEmail: string;
  phone?: string;
  dateOfBirth: string;
  hireDate: string;
  salary: number;
  departmentId: number;
  departmentName?: string;
  isActive: boolean;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  hireDate: string;
  salary: number;
  departmentId: number;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  hireDate: string;
  salary: number;
  departmentId: number;
  isActive: boolean;
}

export interface DepartmentDto {
  id: number;
  name: string;
  description?: string;
  employeeCount: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UserClaims {
  nameid: string;
  unique_name: string;
  email: string;
  role: string;
  exp: number;
}
