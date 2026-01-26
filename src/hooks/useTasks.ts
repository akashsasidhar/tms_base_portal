import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import type { Task, CreateTaskRequest, UpdateTaskRequest, AssigneeUpdateTaskRequest, GetTasksQuery } from '@/types/task.types';
import { toast } from 'sonner';

/**
 * Get all tasks with query parameters
 */
export const useTasks = (query: GetTasksQuery = {}) => {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskService.getAll(query),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get pending tasks (overdue and not completed)
 */
export const usePendingTasks = (query: GetTasksQuery = {}) => {
  return useQuery({
    queryKey: ['tasks', 'pending', query],
    queryFn: () => taskService.getPending(query),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get completed tasks
 */
export const useCompletedTasks = (query: GetTasksQuery = {}) => {
  return useQuery({
    queryKey: ['tasks', 'completed', query],
    queryFn: () => taskService.getCompleted(query),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single task by ID
 */
export const useTask = (id: string | null) => {
  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = id ? UUID_REGEX.test(id) : false;
  
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getById(id!),
    enabled: !!id && isValidUUID && id !== 'new',
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Create task mutation
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update task mutation
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      toast.success('Task updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete task mutation
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete task';
      toast.error(errorMessage);
    },
  });
};

/**
 * Assignee update task mutation (limited fields: status, output_file_url, comment)
 */
export const useAssigneeUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssigneeUpdateTaskRequest }) =>
      taskService.assigneeUpdate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      toast.success('Task updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update task';
      toast.error(errorMessage);
    },
  });
};
