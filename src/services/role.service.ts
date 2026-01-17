import apiClient from '@/lib/api-client';
import type { Role } from '@/types/role.types';
import type { PaginatedResponse } from '@/types/common.types';

export const roleService = {
  getAll: async (params?: { name?: string; page?: number; limit?: number; is_active?: boolean }) => {
    const response = await apiClient.get<PaginatedResponse<Role>>('/roles', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },
  create: async (data: unknown) => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },
  update: async (id: string, data: unknown) => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },
};
