import type { User, UserContact, Role } from './user.types';

// Login Request
export interface LoginRequest {
  contact: string;
  password: string;
  contact_type?: string; // Optional, backend will auto-detect
}

// Register Request
export interface RegisterRequest {
  username: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  contacts: ContactInput[];
  role_ids?: string[];
}

// Contact Input for Registration
export interface ContactInput {
  contact_type_id: string;
  contact: string;
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  contact: string;
  contact_type?: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  user_id: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SetupPasswordRequest {
  token: string;
  user_id: string;
  password: string;
  confirm_password: string;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

// Auth State
export interface AuthState {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Re-export user types for convenience
export type { User, UserContact, Role };
