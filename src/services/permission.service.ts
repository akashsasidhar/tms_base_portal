// Permission service will be implemented in Phase 8
import apiClient from '@/lib/api-client';

export const permissionService = {
  getAll: async () => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },
  getByResource: async (resource: string) => {
    const response = await apiClient.get(`/permissions/by-resource?resource=${resource}`);
    return response.data;
  },
};
