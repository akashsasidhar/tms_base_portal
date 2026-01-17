import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import type { PaginatedResponse } from '@/types/common.types';
import type { Role } from '@/types/role.types';
import { toast } from 'sonner';

export const useRoles = (params?: { name?: string; page?: number; limit?: number; is_active?: boolean }) => {
  return useQuery<PaginatedResponse<Role>>({
    queryKey: ['roles', params],
    queryFn: () => roleService.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useRole = (id: string | null) => {
  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = id ? UUID_REGEX.test(id) : false;
  
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id!),
    enabled: !!id && isValidUUID && id !== 'new',
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string | null }) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create role';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string | null; is_active?: boolean } }) =>
      roleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      toast.success('Role updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update role';
      toast.error(errorMessage);
    },
  });
};
