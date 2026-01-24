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
          
          // Get permissions from user object (set by authService) or fetch separately
          let permissions: string[] = (user as any).permissions || [];
          
          // Debug: Log permissions from login
          console.log('[AuthStore] Login - Permissions from user object:', permissions);
          
          // If permissions weren't included in login response, fetch them
          if (permissions.length === 0) {
            console.log('[AuthStore] Login - No permissions in response, fetching separately...');
            try {
              permissions = await authService.getPermissions();
              console.log('[AuthStore] Login - Fetched permissions:', permissions);
            } catch (permError) {
              console.warn('[AuthStore] Login - Failed to fetch permissions:', permError);
              // Continue without permissions - they can be fetched later via checkAuth
            }
          }
          
          console.log('[AuthStore] Login - Final permissions to store:', permissions);
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
          console.warn('Backend logout failed:', error);
        });
        
        toast.success('Logged out successfully');
      },

      // Check authentication status
      checkAuth: async () => {
        set({ isLoading: true });

        try {
          // Make API call to verify session
          // HTTP-only cookies are automatically sent via withCredentials: true
          // If cookies are invalid/missing, API will return 401
          const result = await authService.getCurrentUser();
          // getCurrentUser returns { user, permissions }
          console.log('[AuthStore] checkAuth - Permissions received:', result.permissions);
          set({ 
            user: result.user, 
            permissions: result.permissions || [], 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          // If checkAuth fails (invalid/missing cookies), clear state
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
