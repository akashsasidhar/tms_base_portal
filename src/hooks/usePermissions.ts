import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { permissions } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((perm) => permissions.includes(perm));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((perm) => permissions.includes(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
