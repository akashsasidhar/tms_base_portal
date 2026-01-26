/**
 * Admin roles that have elevated permissions
 */
export const ADMIN_ROLES = ['Project Manager', 'Admin', 'Super Admin'] as const;

/**
 * Roles excluded from task type selection
 */
export const EXCLUDED_TASK_TYPE_ROLES = ['Project Manager', 'Admin', 'Super Admin', 'User'] as const;

/**
 * Check if a role name is an admin role
 */
export function isAdminRole(roleName: string): boolean {
  return ADMIN_ROLES.some(
    (adminRole) => roleName.toLowerCase() === adminRole.toLowerCase()
  );
}

/**
 * Check if a role name should be excluded from task types
 */
export function isExcludedTaskTypeRole(roleName: string): boolean {
  return EXCLUDED_TASK_TYPE_ROLES.some(
    (excluded) => roleName.toLowerCase() === excluded.toLowerCase()
  );
}

/**
 * Check if user has any admin role
 */
export function hasAdminRole(roles: Array<{ id: string; name: string }> | undefined): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((role) => isAdminRole(role.name));
}

/**
 * Filter roles to exclude admin and user roles (for task types)
 */
export function filterTaskTypeRoles(
  roles: Array<{ id: string; name: string }>
): Array<{ id: string; name: string }> {
  return roles.filter((role) => !isExcludedTaskTypeRole(role.name));
}
