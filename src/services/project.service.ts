import apiClient from '@/lib/api-client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  GetProjectsQuery,
  ProjectsResponse,
  ProjectResponse,
} from '@/types/project.types';
import type { PaginatedResponse } from '@/types/common.types';

class ProjectService {
  /**
   * Get all projects with pagination, filtering, and sorting
   */
  async getAll(query: GetProjectsQuery = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.name) params.append('name', query.name);
    if (query.created_by) params.append('created_by', query.created_by);
    if (query.is_active !== undefined) params.append('is_active', query.is_active.toString());
    if (query.start_date_from) params.append('start_date_from', query.start_date_from);
    if (query.start_date_to) params.append('start_date_to', query.start_date_to);
    if (query.end_date_from) params.append('end_date_from', query.end_date_from);
    if (query.end_date_to) params.append('end_date_to', query.end_date_to);
    if (query.sort_field) params.append('sort_field', query.sort_field);
    if (query.sort_order) params.append('sort_order', query.sort_order);

    const response = await apiClient.get<ProjectsResponse>(`/projects?${params.toString()}`);
    return {
      success: response.data.success,
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    const response = await apiClient.get<ProjectResponse>(`/projects/${id}`);
    return response.data.data;
  }

  /**
   * Create new project
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<ProjectResponse>('/projects', data);
    return response.data.data;
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put<ProjectResponse>(`/projects/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }

  /**
   * Get simplified list of projects (for dropdowns, etc.)
   * No permission required - only authentication
   */
  async getList(query: { is_active?: boolean } = {}): Promise<Array<{ id: string; name: string; is_active: boolean }>> {
    const params = new URLSearchParams();
    if (query.is_active !== undefined) {
      params.append('is_active', query.is_active.toString());
    }

    const response = await apiClient.get<{ success: boolean; data: Array<{ id: string; name: string; is_active: boolean }>; message: string }>(
      `/projects/list?${params.toString()}`
    );
    return response.data.data;
  }
}

export const projectService = new ProjectService();
