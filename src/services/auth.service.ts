import apiClient from '@/lib/api-client';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  SetupPasswordRequest,
  AuthResponse,
  User,
} from '@/types/auth.types';

class AuthService {
  /**
   * Login with contact (email/phone) and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const user = response.data.data.user;
    
    // Transform contacts to match expected format
    if (user.contacts) {
      user.contacts = user.contacts.map((contact: any) => ({
        ...contact,
        contact_type: contact.contactType?.contact_type || contact.contact_type || '',
        contact_type_id: contact.contact_type_id || contact.contactType?.id || '',
      }));
    }
    
    return user;
  }

  /**
   * Register new user with multiple contacts
   */
  async register(data: Omit<RegisterRequest, 'confirm_password'>): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.data.user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User; permissions: string[] }> {
    const response = await apiClient.get<{ success: boolean; data: { user: User; permissions: string[] } }>('/auth/me');
    return {
      user: response.data.data.user,
      permissions: response.data.data.permissions || [],
    };
  }

  /**
   * Get current user permissions
   * Note: This should be included in /auth/me response, but we have a separate endpoint for flexibility
   */
  async getPermissions(): Promise<string[]> {
    try {
      // Try to get permissions from /auth/me first
      const userResponse = await apiClient.get<{ success: boolean; data: { user: User; permissions?: string[] } }>('/auth/me');
      if (userResponse.data.data.permissions) {
        return userResponse.data.data.permissions;
      }
      // Fallback: try dedicated endpoint
      const response = await apiClient.get<{ success: boolean; data: { permissions: string[] } }>('/auth/permissions');
      return response.data.data.permissions || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', data);
  }

  /**
   * Setup password for first-time user verification
   */
  async setupPassword(data: SetupPasswordRequest): Promise<void> {
    await apiClient.post('/auth/setup-password', {
      token: data.token,
      user_id: data.user_id,
      password: data.password,
      confirm_password: data.confirm_password,
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    await apiClient.post('/auth/refresh');
  }

  /**
   * Verify contact with verification code
   */
  async verifyContact(contactId: string, code: string): Promise<void> {
    await apiClient.post('/auth/verify-contact', { contact_id: contactId, code });
  }
}

export const authService = new AuthService();
