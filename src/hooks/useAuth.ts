import { useAuthStore } from '@/store/authStore';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { useMemo, useCallback } from 'react';
import type { UserContact } from '@/types/auth.types';
import { hasAdminRole as checkAdminRole } from '@/utils/role.util';

export const useAuth = () => {
  // Use shallow comparison to prevent unnecessary re-renders
  const {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  } = useStoreWithEqualityFn(
    useAuthStore,
    (state) => ({
      user: state.user,
      permissions: state.permissions,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      logout: state.logout,
      checkAuth: state.checkAuth,
      clearError: state.clearError,
    }),
    shallow
  );

  // Helper functions for role checks
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user || !user.roles || user.roles.length === 0) {
        return false;
      }
      return user.roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase());
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roleNames: string[]): boolean => {
      if (!user || !user.roles || user.roles.length === 0) {
        return false;
      }
      return roleNames.some((roleName) =>
        user.roles!.some((role) => role.name.toLowerCase() === roleName.toLowerCase())
      );
    },
    [user]
  );

  // Helper functions for contacts
  const getPrimaryContact = useCallback((): string | null => {
    if (!user || !user.contacts || user.contacts.length === 0) {
      return null;
    }
    const primaryContact = user.contacts.find((contact) => contact.is_primary);
    return primaryContact ? primaryContact.contact : null;
  }, [user]);

  const getContactByType = useCallback(
    (contactType: string): UserContact | null => {
      if (!user || !user.contacts || user.contacts.length === 0) {
        return null;
      }
      return (
        user.contacts.find(
          (contact) => contact.contact_type?.toLowerCase() === contactType.toLowerCase()
        ) || null
      );
    },
    [user]
  );

  const getContactsByType = useCallback(
    (contactType: string): UserContact[] => {
      if (!user || !user.contacts || user.contacts.length === 0) {
        return [];
      }
      return user.contacts.filter(
        (contact) => contact.contact_type?.toLowerCase() === contactType.toLowerCase()
      );
    },
    [user]
  );

  // Check if user has admin role
  const hasAdminRole = useCallback((): boolean => {
    return checkAdminRole(user?.roles);
  }, [user?.roles]);

  return {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
    hasRole,
    hasAnyRole,
    hasAdminRole,
    getPrimaryContact,
    getContactByType,
    getContactsByType,
  };
};
