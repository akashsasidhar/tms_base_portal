import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/common.types';

export interface Statistics {
  total_users: number;
  total_roles: number;
  active_users: number;
  total_contacts: number;
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<Statistics> {
    const response = await apiClient.get<ApiResponse<Statistics>>('/dashboard/statistics');
    return response.data.data!;
  }
}

export const dashboardService = new DashboardService();
