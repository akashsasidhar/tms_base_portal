import { useAuthStore } from '@/store/authStore';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

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
  };
};
