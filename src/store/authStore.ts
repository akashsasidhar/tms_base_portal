import { createWithEqualityFn } from 'zustand/traditional';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface AuthStore {
  // State
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null, permissions?: string[]) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Auth methods
  login: (contact: string, password: string, contactType?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = createWithEqualityFn<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Setters
      setUser: (user, permissions = []) =>
        set({ user, isAuthenticated: !!user, permissions }),
      setPermissions: (permissions) => set({ permissions }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Login
      login: async (contact, password, contactType) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login({ contact, password, contact_type: contactType });
          
          // Fetch permissions after successful login
          let permissions: string[] = [];
          try {
            permissions = await authService.getPermissions();
          } catch (permError) {
            console.warn('Failed to fetch permissions:', permError);
            // Continue without permissions - they can be fetched later
          }
          
          set({ user, permissions, isAuthenticated: true, isLoading: false });
          toast.success('Login successful');
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Login failed. Please check your credentials.';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Logout
      logout: async () => {
        // Clear state immediately (don't wait for API call)
        set({
          user: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear persisted storage immediately
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
        }

        // Try to call logout API (but don't wait for it or retry on failure)
        // This prevents infinite loops if the token is already invalid
        authService.logout().catch((error) => {
          // Silently ignore logout API errors - we've already cleared state
          // This prevents infinite loops when token is invalid
        });
        
        toast.success('Logged out successfully');
      },

      // Check authentication status
      checkAuth: async () => {
        set({ isLoading: true });
        
        // Check if refresh token exists before making API call
        if (typeof window !== 'undefined') {
          const hasRefreshToken = document.cookie.split(';').some(c => c.trim().startsWith('refreshToken='));
          if (!hasRefreshToken) {
            // No refresh token - force logout immediately
            set({
              user: null,
              permissions: [],
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();
            // Throw error to trigger redirect in layout
            throw new Error('Refresh token not available');
          }
        }

        try {
          const result = await authService.getCurrentUser();
          // getCurrentUser returns { user, permissions }
          set({ 
            user: result.user, 
            permissions: result.permissions, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          // If checkAuth fails, clear state and force logout
          set({ 
            user: null, 
            permissions: [], 
            isAuthenticated: false, 
            isLoading: false,
            error: null,
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();
          }
          // Re-throw error to trigger redirect in layout
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
