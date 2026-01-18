/**
 * Utility functions for working with cookies
 * 
 * NOTE: HTTP-only cookies cannot be accessed via document.cookie in JavaScript.
 * These functions are only useful for non-HTTP-only cookies.
 * For HTTP-only cookies (like accessToken/refreshToken), rely on:
 * - Middleware (server-side) to check cookies
 * - API calls with withCredentials: true to send cookies automatically
 */

/**
 * Check if a cookie exists (only works for non-HTTP-only cookies)
 * @deprecated For HTTP-only cookies, use middleware or API calls instead
 */
export function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`));
}

/**
 * Get cookie value by name (only works for non-HTTP-only cookies)
 * @deprecated For HTTP-only cookies, use middleware or API calls instead
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
 * 
 * NOTE: This cannot detect HTTP-only cookies. Since refreshToken is HTTP-only,
 * this will always return false. Instead, rely on:
 * - Middleware to check cookies server-side
 * - API calls to verify session validity
 * - Persisted auth state from localStorage
 * 
 * @deprecated Use middleware or API calls to check HTTP-only cookies
 */
export function hasRefreshToken(): boolean {
  // HTTP-only cookies are not accessible via document.cookie
  // Return false and let middleware/API handle authentication
  return false;
}

/**
 * Check if access token exists
 * 
 * NOTE: This cannot detect HTTP-only cookies. Since accessToken is HTTP-only,
 * this will always return false.
 * 
 * @deprecated Use middleware or API calls to check HTTP-only cookies
 */
export function hasAccessToken(): boolean {
  // HTTP-only cookies are not accessible via document.cookie
  return false;
}
