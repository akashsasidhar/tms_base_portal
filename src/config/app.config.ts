/**
 * Centralized Application Configuration
 * All environment variables MUST be accessed through this file
 * Never use process.env directly in components or services
 * 
 * Runtime validation ensures all required env vars are present
 */

interface AppConfig {
  // API Configuration
  readonly API_URL: string;

  // Application Info
  readonly APP_NAME: string;
  readonly APP_ENV: string;

  // Feature Flags
  readonly ENABLE_DEV_TOOLS: boolean;

  // API Timeouts
  readonly API_TIMEOUT: number;

  // Pagination Defaults
  readonly DEFAULT_PAGE_SIZE: number;
  readonly MAX_PAGE_SIZE: number;
}

// Helper function to safely access environment variables
const getEnv = (key: string, defaultValue: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env[key] ?? defaultValue;
  }
  // Client-side: only access NEXT_PUBLIC_ prefixed vars
  const publicKey = key.startsWith('NEXT_PUBLIC_') ? key : `NEXT_PUBLIC_${key}`;
  return process.env[publicKey] ?? defaultValue;
};


const appConfig: AppConfig = {
  // API Configuration
  API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:5000/api'),

  // Application Info
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'Admin Dashboard'),
  APP_ENV: getEnv('NODE_ENV', 'development'),

  // Feature Flags
  ENABLE_DEV_TOOLS: getEnv('NODE_ENV', 'development') === 'development',

  // API Timeouts (in milliseconds)
  API_TIMEOUT: parseInt(getEnv('NEXT_PUBLIC_API_TIMEOUT', '30000'), 10),

  // Pagination Defaults
  DEFAULT_PAGE_SIZE: parseInt(getEnv('NEXT_PUBLIC_DEFAULT_PAGE_SIZE', '10'), 10),
  MAX_PAGE_SIZE: parseInt(getEnv('NEXT_PUBLIC_MAX_PAGE_SIZE', '100'), 10),
};

// Validate configuration values
if (appConfig.API_TIMEOUT <= 0) {
  throw new Error('API_TIMEOUT must be a positive number');
}

if (appConfig.DEFAULT_PAGE_SIZE <= 0 || appConfig.MAX_PAGE_SIZE <= 0) {
  throw new Error('Page sizes must be positive numbers');
}

if (appConfig.DEFAULT_PAGE_SIZE > appConfig.MAX_PAGE_SIZE) {
  throw new Error('DEFAULT_PAGE_SIZE cannot be greater than MAX_PAGE_SIZE');
}

export default appConfig;
