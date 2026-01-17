import apiClient from '@/lib/api-client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AddContactRequest,
  UpdateContactRequest,
  GetUsersQuery,
  UsersResponse,
  UserResponse,
} from '@/types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/types/common.types';

class UserService {
  /**
   * Get all users with pagination, filtering, and sorting
   */
  async getAll(query: GetUsersQuery = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.role_id) params.append('role_id', query.role_id);
    if (query.is_active !== undefined) params.append('is_active', query.is_active.toString());
    if (query.contact_type) params.append('contact_type', query.contact_type);
    if (query.sort_by) params.append('sort_by', query.sort_by);
    if (query.sort_order) params.append('sort_order', query.sort_order);

    const response = await apiClient.get<UsersResponse>(`/users?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data.data;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<UserResponse>('/users', data);
    return response.data.data;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  /**
   * Restore soft-deleted user
   */
  async restore(id: string): Promise<User> {
    const response = await apiClient.post<UserResponse>(`/users/${id}/restore`);
    return response.data.data;
  }

  /**
   * Add contact to user
   */
  async addContact(userId: string, contactData: AddContactRequest): Promise<void> {
    await apiClient.post(`/users/${userId}/contacts`, contactData);
  }

  /**
   * Remove contact from user
   */
  async removeContact(userId: string, contactId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/contacts/${contactId}`);
  }

  /**
   * Update user contact
   */
  async updateContact(userId: string, contactId: string, contactData: UpdateContactRequest): Promise<void> {
    await apiClient.put(`/users/${userId}/contacts/${contactId}`, contactData);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/roles`, { role_id: roleId });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/roles/${roleId}`);
  }

  /**
   * Change user password (admin action)
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    await apiClient.put(`/users/${userId}/change-password`, { password: newPassword });
  }

  /**
   * Bulk delete users
   */
  async bulkDelete(userIds: string[]): Promise<void> {
    await apiClient.post('/users/bulk-delete', { user_ids: userIds });
  }

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds: string[]): Promise<void> {
    await apiClient.post('/users/bulk-activate', { user_ids: userIds });
  }

  /**
   * Bulk deactivate users
   */
  async bulkDeactivate(userIds: string[]): Promise<void> {
    await apiClient.post('/users/bulk-deactivate', { user_ids: userIds });
  }
}

export const userService = new UserService();
