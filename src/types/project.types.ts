/**
 * Project Types for Frontend
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface GetProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  created_by?: string;
  is_active?: boolean;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  sort_field?: 'name' | 'created_at' | 'start_date' | 'end_date';
  sort_order?: 'ASC' | 'DESC';
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
  message: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message: string;
}
