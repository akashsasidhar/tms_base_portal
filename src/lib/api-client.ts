import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import appConfig from '@/config/app.config';

const apiClient = axios.create({
  baseURL: appConfig.API_URL,
  timeout: appConfig.API_TIMEOUT,
  withCredentials: true, // CRITICAL for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth tokens or headers here if needed
    // For now, cookies are handled automatically via withCredentials
    // Cookies are HTTP-only and secure (set by backend)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling and retry mechanism
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _skipRefresh?: boolean;
      _retryCount?: number;
    };

    // Initialize retry count if not set
    const retryCount = originalRequest._retryCount || 0;
    const MAX_RETRIES = 2;

    // Skip token refresh for logout and public auth endpoints
    const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
    const isPublicAuthEndpoint = 
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password') ||
      originalRequest.url?.includes('/auth/setup-password');

    // Skip retry mechanism for 401 errors (handled separately with token refresh)
    // Skip retry for logout and public auth endpoints
    const shouldSkipRetry = 
      error.response?.status === 401 || 
      isLogoutRequest || 
      isPublicAuthEndpoint ||
      originalRequest._skipRefresh;

    // Determine if error is retryable
    const isRetryableError = (): boolean => {
      // Don't retry if should skip
      if (shouldSkipRetry) {
        return false;
      }

      // Don't retry if already retried max times
      if (retryCount >= MAX_RETRIES) {
        return false;
      }

      // Don't retry for non-retryable status codes (4xx client errors, except 408, 429)
      if (error.response?.status) {
        const status = error.response.status;
        // Retry on 5xx server errors
        if (status >= 500 && status < 600) {
          return true;
        }
        // Retry on 408 Request Timeout
        if (status === 408) {
          return true;
        }
        // Retry on 429 Too Many Requests
        if (status === 429) {
          return true;
        }
        // Don't retry on other 4xx client errors
        if (status >= 400 && status < 500) {
          return false;
        }
      }

      // Retry on network errors (no response)
      if (!error.response) {
        return true;
      }

      return false;
    };

    // Retry mechanism for retryable errors
    if (isRetryableError()) {
      originalRequest._retryCount = retryCount + 1;

      // Calculate delay: exponential backoff (1s, 2s)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 2000);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return apiClient(originalRequest);
    }

    // For logout requests with 401, just reject silently without trying to refresh
    // The logout handler will clear state anyway - no need to show errors
    if (error.response?.status === 401 && isLogoutRequest) {
      // Silently reject - logout already cleared state
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired or invalid
    // Skip retry mechanism for 401 as it has its own refresh token logic
    // IMPORTANT: Skip refresh for logout requests (already handled above)
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest && !isPublicAuthEndpoint) {
      originalRequest._retry = true;
      originalRequest._skipRefresh = true; // Prevent general retry mechanism from interfering

      try {
        // Check if we're already on login page or state is cleared (prevent refresh attempts after logout)
        if (typeof window !== 'undefined') {
          const isOnLoginPage = window.location.pathname === '/login';
          const hasAuthStorage = localStorage.getItem('auth-storage');
          if (isOnLoginPage || !hasAuthStorage) {
            // Already logged out or on login page - don't try to refresh
            return Promise.reject(error);
          }
        }

        // Attempt to refresh token
        // HTTP-only cookies are automatically sent via withCredentials: true
        // If cookies are missing/invalid, this will return 401
        await apiClient.post('/auth/refresh');
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear state without calling logout API (to prevent loop)
        // Don't show error messages for refresh failures during logout
        if (typeof window !== 'undefined') {
          // Import authStore dynamically to avoid circular dependency
          import('@/store/authStore').then(({ useAuthStore }) => {
            const store = useAuthStore.getState();
            // Only clear if not already cleared (prevent multiple redirects)
            if (store.isAuthenticated) {
              store.setUser(null);
              store.setPermissions([]);
              store.setLoading(false);
              localStorage.removeItem('auth-storage');
              sessionStorage.clear();
              // Redirect to login if not already there
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          });
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'You do not have permission to perform this action';
      
      toast.error(errorMessage);
      
      // Optionally redirect to dashboard after a delay
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
      
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Resource not found';
      
      toast.error(errorMessage);
      return Promise.reject(error);
    }

    // Handle 500 Internal Server Error (after retries exhausted)
    if (error.response?.status === 500) {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'An internal server error occurred. Please try again later.';
      
      toast.error(errorMessage, {
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle network errors (after retries exhausted)
    if (!error.response) {
      toast.error('Network error. Please check your connection and try again.', {
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle other errors (400, 422, etc.)
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'An error occurred';

    // Show toast notification for errors (except 401 and logout requests which are handled above)
    // Don't show errors for logout requests - they're expected to fail if token is already invalid
    if (error.response?.status !== 401 && !isLogoutRequest && typeof window !== 'undefined') {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
