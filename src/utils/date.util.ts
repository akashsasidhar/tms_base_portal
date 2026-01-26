import { format } from 'date-fns';

/**
 * Format date for HTML input[type="date"] field
 * Converts Date object or ISO string to YYYY-MM-DD format
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Format date for display (e.g., "MMM dd, yyyy")
 */
export function formatDateDisplay(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM dd, yyyy'
): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return format(dateObj, formatStr);
  } catch {
    return '-';
  }
}

/**
 * Format date for detailed display (e.g., "MMMM d, yyyy 'at' h:mm a")
 */
export function formatDateDetailed(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return format(dateObj, 'PPpp');
  } catch {
    return '-';
  }
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): boolean {
  if (!startDate || !endDate) return true; // Allow if either is missing
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
    return end >= start;
  } catch {
    return true;
  }
}

/**
 * Get current year (for copyright, etc.)
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
