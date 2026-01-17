import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, CreateUserRequest, UpdateUserRequest, GetUsersQuery } from '@/types/user.types';
import { toast } from 'sonner';

/**
 * Get all users with query parameters
 */
export const useUsers = (query: GetUsersQuery = {}) => {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () => userService.getAll(query),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single user by ID
 */
export const useUser = (id: string | null) => {
  // UUID validation regex
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = id ? UUID_REGEX.test(id) : false;
  
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id!),
    enabled: !!id && isValidUUID && id !== 'new',
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Create user mutation
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Update user mutation
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete user';
      toast.error(errorMessage);
    },
  });
};

/**
 * Add contact mutation
 */
export const useAddContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, contactData }: { userId: string; contactData: { contact_type_id: string; contact: string } }) =>
      userService.addContact(userId, contactData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('Contact added successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to add contact';
      toast.error(errorMessage);
    },
  });
};

/**
 * Remove contact mutation
 */
export const useRemoveContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, contactId }: { userId: string; contactId: string }) =>
      userService.removeContact(userId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('Contact removed successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove contact';
      toast.error(errorMessage);
    },
  });
};

/**
 * Assign role mutation
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userService.assignRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('Role assigned successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to assign role';
      toast.error(errorMessage);
    },
  });
};

/**
 * Remove role mutation
 */
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userService.removeRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('Role removed successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to remove role';
      toast.error(errorMessage);
    },
  });
};

/**
 * Change password mutation
 */
export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      userService.changePassword(userId, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      toast.error(errorMessage);
    },
  });
};

/**
 * Bulk delete mutation
 */
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userService.bulkDelete(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Users deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete users';
      toast.error(errorMessage);
    },
  });
};

/**
 * Bulk activate mutation
 */
export const useBulkActivateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userService.bulkActivate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Users activated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to activate users';
      toast.error(errorMessage);
    },
  });
};

/**
 * Bulk deactivate mutation
 */
export const useBulkDeactivateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userService.bulkDeactivate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Users deactivated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to deactivate users';
      toast.error(errorMessage);
    },
  });
};
