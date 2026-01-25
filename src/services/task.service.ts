import apiClient from '@/lib/api-client';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  GetTasksQuery,
  TasksResponse,
  TaskResponse,
} from '@/types/task.types';
import type { PaginatedResponse } from '@/types/common.types';

class TaskService {
  /**
   * Get all tasks with pagination, filtering, and sorting
   */
  async getAll(query: GetTasksQuery = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.project_id) params.append('project_id', query.project_id);
    if (query.title) params.append('title', query.title);
    if (query.task_type) params.append('task_type', query.task_type);
    if (query.priority) params.append('priority', query.priority);
    if (query.status) params.append('status', query.status);
    if (query.created_by) params.append('created_by', query.created_by);
    if (query.assigned_to) params.append('assigned_to', query.assigned_to);
    if (query.is_active !== undefined) params.append('is_active', query.is_active.toString());
    if (query.list_type) params.append('list_type', query.list_type);
    if (query.due_date_from) params.append('due_date_from', query.due_date_from);
    if (query.due_date_to) params.append('due_date_to', query.due_date_to);
    if (query.sort_field) params.append('sort_field', query.sort_field);
    if (query.sort_order) params.append('sort_order', query.sort_order);

    const response = await apiClient.get<TasksResponse>(`/tasks?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Get pending tasks (overdue and not completed)
   */
  async getPending(query: GetTasksQuery = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.project_id) params.append('project_id', query.project_id);
    if (query.task_type) params.append('task_type', query.task_type);
    if (query.priority) params.append('priority', query.priority);
    if (query.assigned_to) params.append('assigned_to', query.assigned_to);
    if (query.sort_field) params.append('sort_field', query.sort_field);
    if (query.sort_order) params.append('sort_order', query.sort_order);

    const response = await apiClient.get<TasksResponse>(`/tasks/pending?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Get completed tasks
   */
  async getCompleted(query: GetTasksQuery = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.project_id) params.append('project_id', query.project_id);
    if (query.task_type) params.append('task_type', query.task_type);
    if (query.priority) params.append('priority', query.priority);
    if (query.assigned_to) params.append('assigned_to', query.assigned_to);
    if (query.sort_field) params.append('sort_field', query.sort_field);
    if (query.sort_order) params.append('sort_order', query.sort_order);

    const response = await apiClient.get<TasksResponse>(`/tasks/completed?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task> {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return response.data.data;
  }

  /**
   * Create new task
   */
  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.data.data;
  }

  /**
   * Update task
   */
  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }
}

export const taskService = new TaskService();
