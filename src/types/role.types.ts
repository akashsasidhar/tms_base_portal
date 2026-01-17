// Role types will be implemented in Phase 8
export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  users_count?: number;
  permissions_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}
