import { useAuth } from '@/hooks/useAuth';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (permission: string): boolean => {
  // This will be used in components, so we need to get permissions from store
  // For now, return a helper that can be used in components
  return false; // Placeholder - will be implemented in components using useAuth
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
  return false; // Placeholder
};

/**
 * Check if user can access a route based on permission
 */
export const canAccessRoute = (route: string): boolean => {
  // Route to permission mapping
  const routePermissions: Record<string, string> = {
    '/users': 'users:read',
    '/roles': 'roles:read',
    '/contact-types': 'contact-types:read',
    '/permissions': 'permissions:read',
  };

  const permission = routePermissions[route];
  if (!permission) return true; // No permission required

  return hasPermission(permission);
};
