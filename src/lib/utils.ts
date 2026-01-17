import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize string to prevent XSS attacks
 * Only use for simple text content, not HTML
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  // Remove potentially dangerous characters
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Escape HTML to prevent XSS attacks
 * Use when rendering user-generated content
 */
export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
};

/**
 * Validate URL to prevent XSS and open redirect attacks
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Safe redirect - validates URL before redirecting
 */
export const safeRedirect = (url: string, fallback: string = '/dashboard'): void => {
  if (typeof window === 'undefined') return;
  
  const targetUrl = isValidUrl(url) ? url : fallback;
  window.location.href = targetUrl;
};
