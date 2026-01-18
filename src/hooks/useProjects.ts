import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import type { Project, CreateProjectRequest, UpdateProjectRequest, GetProjectsQuery } from '@/types/project.types';
import { toast } from 'sonner';

/**
 * Get all projects with query parameters
 */
export const useProjects = (query: GetProjectsQuery = {}) => {
  return useQuery({
    queryKey: ['projects', query],
    queryFn: () => projectService.getAll(query),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single project by ID
 */
export const useProject = (id: string | null) => {
  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = id ? UUID_REGEX.test(id) : false;
  
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id!),
    enabled: !!id && isValidUUID && id !== 'new',
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Create project mutation
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create project';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update project mutation
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Project updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update project';
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete project mutation
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete project';
      toast.error(errorMessage);
    },
  });
};
