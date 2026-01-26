import type { User } from '@/types/user.types';

/**
 * Get user display name (first_name last_name or username)
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return '';
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return name || user.username || '';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return 'U';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return user.username?.[0]?.toUpperCase() || 'U';
}

/**
 * Filter users by role name
 */
export function filterUsersByRole(
  users: Array<{ id: string; roles?: Array<{ id: string; name: string }> }>,
  roleName: string
): Array<{ id: string; roles?: Array<{ id: string; name: string }> }> {
  return users.filter((u) => {
    if (!u.roles || u.roles.length === 0) return false;
    return u.roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase());
  });
}

/**
 * Get assignee names from task assignees array
 */
export function getAssigneeNames(
  assignees: Array<{ user?: { first_name?: string; last_name?: string; username?: string } }> | null | undefined
): string {
  if (!assignees || assignees.length === 0) return 'Unassigned';
  
  const names = assignees
    .map((a) => {
      if (!a.user) return null;
      const name = `${a.user.first_name || ''} ${a.user.last_name || ''}`.trim();
      return name || a.user.username || null;
    })
    .filter((name): name is string => name !== null);
  
  return names.length > 0 ? names.join(', ') : 'Unassigned';
}
