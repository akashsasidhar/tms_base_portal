/**
 * Utility functions for working with cookies
 */

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`));
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Check if refresh token exists
 */
export function hasRefreshToken(): boolean {
  return hasCookie('refreshToken');
}

/**
 * Check if access token exists
 */
export function hasAccessToken(): boolean {
  return hasCookie('accessToken');
}
