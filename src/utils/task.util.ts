/**
 * Task priority constants
 */
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

/**
 * Task status constants
 */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

/**
 * Priority badge variant mapping
 */
export const PRIORITY_COLORS: Record<TaskPriority, 'default' | 'secondary' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'destructive',
};

/**
 * Status badge variant mapping
 */
export const STATUS_COLORS: Record<TaskStatus, 'default' | 'secondary' | 'outline'> = {
  TODO: 'outline',
  IN_PROGRESS: 'default',
  REVIEW: 'secondary',
  DONE: 'default',
};

/**
 * Format task status for display (replace underscores with spaces)
 */
export function formatTaskStatus(status: string): string {
  return status.replace('_', ' ');
}

/**
 * Get priority badge variant
 */
export function getPriorityVariant(
  priority: string | undefined
): 'default' | 'secondary' | 'destructive' {
  if (!priority) return 'default';
  return PRIORITY_COLORS[priority as TaskPriority] || 'default';
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status: string | undefined
): 'default' | 'secondary' | 'outline' {
  if (!status) return 'outline';
  return STATUS_COLORS[status as TaskStatus] || 'outline';
}

/**
 * Validate task date range (due_date >= started_date)
 */
export function validateTaskDateRange(
  startedDate: string | Date | null | undefined,
  dueDate: string | Date | null | undefined
): boolean {
  if (!startedDate || !dueDate) return true; // Allow if either is missing
  try {
    const started = typeof startedDate === 'string' ? new Date(startedDate) : startedDate;
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    if (isNaN(started.getTime()) || isNaN(due.getTime())) return true;
    return due >= started;
  } catch {
    return true;
  }
}
