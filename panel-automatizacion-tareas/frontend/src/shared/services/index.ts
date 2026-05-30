import api from './api';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  logout: () => api.post<ApiResponse<void>>('/auth/logout'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/auth/forgot-password', { email }),
};

export const userService = {
  getProfile: () => api.get<ApiResponse<User>>('/users/me'),
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: number, data: unknown) => api.put(`/users/${id}`, data),
  toggleActive: (id: number, active: boolean) =>
    api.patch(`/users/${id}/active`, null, { params: { active } }),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const automationService = {
  list: (params?: Record<string, unknown>) => api.get('/automations', { params }),
  getById: (id: number) => api.get(`/automations/${id}`),
  create: (data: unknown) => api.post('/automations', data),
  update: (id: number, data: unknown) => api.put(`/automations/${id}`, data),
  delete: (id: number) => api.delete(`/automations/${id}`),
  duplicate: (id: number) => api.post(`/automations/${id}/duplicate`),
  execute: (id: number) => api.post(`/automations/${id}/execute`),
};

export const executionService = {
  list: (params?: Record<string, unknown>) => api.get('/executions', { params }),
};

export const auditService = {
  list: (params?: Record<string, unknown>) => api.get('/audit', { params }),
};

export const dashboardService = {
  get: () => api.get('/dashboard'),
};
