import type { PaginationMeta } from './common.types';

// User types
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  contacts: UserContact[];
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface UserContact {
  id: string;
  contact_type_id: string;
  contact_type: string;
  contact: string;
  is_verified?: boolean;
  is_primary?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

// Request types
export interface CreateUserRequest {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  contacts: ContactInput[];
  role_ids?: string[];
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface ContactInput {
  contact_type_id: string;
  contact: string;
}

export interface AddContactRequest {
  contact_type_id: string;
  contact: string;
}

export interface UpdateContactRequest {
  contact: string;
}

// Query types
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: string;
  is_active?: boolean;
  contact_type?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

// Response types
export interface UsersResponse {
  success: boolean;
  data: User[];
  meta: PaginationMeta;
}

export interface UserResponse {
  success: boolean;
  data: User;
}
