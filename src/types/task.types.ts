/**
 * Task Types for Frontend
 */

export interface Task {
  id: string;
  project_id: string;
  title: string;
  task_type: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  created_by: string;
  started_date: string | null;
  due_date: string | null;
  input_file_url: string | null;
  output_file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  } | null;
  creator?: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  assignees?: Array<{
    id: string;
    user_id: string;
    assigned_by: string;
    assigned_at: string;
    user?: {
      id: string;
      username: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
  }> | null;
}

export interface CreateTaskRequest {
  project_id: string;
  title: string;
  task_type: string;
  description?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  started_date?: string | null;
  due_date?: string | null;
  input_file_url?: string | null;
  output_file_url?: string | null;
  assignee_ids?: string[];
}

export interface AssigneeUpdateTaskRequest {
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  output_file_url?: string | null;
  comment?: string | null;
}

export interface UpdateTaskRequest {
  project_id?: string;
  title?: string;
  task_type?: string;
  description?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  started_date?: string | null;
  due_date?: string | null;
  input_file_url?: string | null;
  output_file_url?: string | null;
  is_active?: boolean;
  assignee_ids?: string[];
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  title?: string;
  task_type?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  created_by?: string;
  assigned_to?: string;
  is_active?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  list_type?: 'active' | 'pending' | 'completed';
  sort_field?: 'title' | 'created_at' | 'due_date' | 'priority' | 'status';
  sort_order?: 'ASC' | 'DESC';
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message: string;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message: string;
}
