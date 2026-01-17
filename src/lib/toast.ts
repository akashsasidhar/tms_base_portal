import { toast } from 'sonner';

/**
 * Standardized toast messages for consistent UX
 */
export const toastMessages = {
  // Success messages
  success: {
    created: (resource: string) => `${resource} created successfully`,
    updated: (resource: string) => `${resource} updated successfully`,
    deleted: (resource: string) => `${resource} deleted successfully`,
    saved: (resource: string) => `${resource} saved successfully`,
    action: (action: string, resource: string) => `${resource} ${action} successfully`,
  },

  // Error messages
  error: {
    create: (resource: string) => `Failed to create ${resource}`,
    update: (resource: string) => `Failed to update ${resource}`,
    delete: (resource: string) => `Failed to delete ${resource}`,
    load: (resource: string) => `Failed to load ${resource}`,
    action: (action: string, resource: string) => `Failed to ${action} ${resource}`,
    generic: 'An error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'Resource not found.',
    serverError: 'Server error. Please try again later.',
  },

  // Info messages
  info: {
    loading: 'Loading...',
    processing: 'Processing...',
    saved: 'Changes saved',
  },

  // Warning messages
  warning: {
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    confirmDelete: (resource: string) => `Are you sure you want to delete this ${resource}?`,
  },
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string, duration?: number) => {
  toast.success(message, { duration: duration || 3000 });
};

/**
 * Show error toast
 */
export const showErrorToast = (message: string, duration?: number) => {
  toast.error(message, { duration: duration || 5000 });
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string, duration?: number) => {
  toast.info(message, { duration: duration || 3000 });
};

/**
 * Show warning toast
 */
export const showWarningToast = (message: string, duration?: number) => {
  toast.warning(message, { duration: duration || 4000 });
};

/**
 * Show loading toast (returns dismiss function)
 */
export const showLoadingToast = (message: string = 'Loading...') => {
  return toast.loading(message);
};

/**
 * Show promise toast (for async operations)
 */
export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};
