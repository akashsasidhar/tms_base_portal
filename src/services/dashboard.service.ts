import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/common.types';

export interface Statistics {
  // Admin/PM stats
  total_projects?: number;
  active_projects?: number;
  total_tasks?: number;
  active_tasks?: number;
  pending_tasks?: number;
  completed_tasks?: number;
  
  // User-specific stats
  my_active_tasks?: number;
  my_pending_tasks?: number;
  my_completed_tasks?: number;
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
