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

// Response interceptor with comprehensive error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _skipRefresh?: boolean;
    };

    // Skip token refresh for logout and public auth endpoints
    const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
    const isPublicAuthEndpoint = 
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password') ||
      originalRequest.url?.includes('/auth/setup-password');

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry && !isLogoutRequest && !isPublicAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        // HTTP-only cookies are automatically sent via withCredentials: true
        // If cookies are missing/invalid, this will return 401
        await apiClient.post('/auth/refresh');
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear state without calling logout API (to prevent loop)
        if (typeof window !== 'undefined') {
          // Import authStore dynamically to avoid circular dependency
          import('@/store/authStore').then(({ useAuthStore }) => {
            const store = useAuthStore.getState();
            // Clear state without calling logout API (to prevent loop)
            store.setUser(null);
            store.setPermissions([]);
            store.setLoading(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage');
              sessionStorage.clear();
            }
          });
        }
        return Promise.reject(refreshError);
      }
    }

    // For logout requests with 401, just reject without trying to refresh
    // The logout handler will clear state anyway
    if (error.response?.status === 401 && isLogoutRequest) {
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'You do not have permission to perform this action';
      
      toast.error(errorMessage);
      
      // Optionally redirect to dashboard after a delay
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
        console.log('-------uimheeeeeeeeeeeeeeeeeeeeeeeee')
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

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'An internal server error occurred. Please try again later.';
      
      toast.error(errorMessage, {
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle network errors
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

    // Show toast notification for errors (except 401 which is handled above)
    if (error.response?.status !== 401 && typeof window !== 'undefined') {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
