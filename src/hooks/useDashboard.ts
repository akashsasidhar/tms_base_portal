import { useQuery } from '@tanstack/react-query';
import { dashboardService, type Statistics } from '@/services/dashboard.service';

export const useDashboard = () => {
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
  } = useQuery<Statistics>({
    queryKey: ['dashboard', 'statistics'],
    queryFn: () => dashboardService.getStatistics(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  return {
    statistics,
    isLoading,
    error,
    refetch,
  };
};
