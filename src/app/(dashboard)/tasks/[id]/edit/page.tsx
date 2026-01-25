'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useUsersList } from '@/hooks/useUsers';
import { useTaskTypes } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Project } from '@/types/project.types';
import type { User } from '@/types/user.types';

// Validation schema
const updateTaskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID').optional(),
  title: z.string().min(1, 'Task title is required').max(255, 'Task title must not exceed 255 characters').optional(),
  task_type: z.string().min(1, 'Task type is required').optional(),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  started_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  input_file_url: z
    .union([z.string().max(500, 'URL must not exceed 500 characters'), z.literal('')])
    .refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), {
      message: 'Invalid URL format',
    })
    .optional()
    .nullable(),
  output_file_url: z
    .union([z.string().max(500, 'URL must not exceed 500 characters'), z.literal('')])
    .refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), {
      message: 'Invalid URL format',
    })
    .optional()
    .nullable(),
  is_active: z.boolean().optional(),
  assignee_ids: z.array(z.string().uuid('Invalid assignee ID')).optional(),
}).refine(
  (data) => {
    // If both dates are provided, due_date should be after started_date
    if (data.started_date && data.due_date) {
      return new Date(data.due_date) >= new Date(data.started_date);
    }
    return true;
  },
  {
    message: 'Due date must be after start date',
    path: ['due_date'],
  }
);

type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

// Roles to exclude from task types
const EXCLUDED_ROLES = ['Project Manager', 'Admin', 'Super Admin'];

export default function EditTaskPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const taskId = params?.id || '';
  const { data: task, isLoading: isLoadingTask, error: taskError } = useTask(taskId);
  
  // Debug: Log task ID and loading state
  useEffect(() => {
    if (taskId) {
      console.log('Task ID:', taskId);
      console.log('Loading:', isLoadingTask);
      console.log('Task data:', task);
      console.log('Task error:', taskError);
    }
  }, [taskId, isLoadingTask, task, taskError]);
  const { mutate: updateTask, isPending } = useUpdateTask();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      project_id: '',
      title: '',
      task_type: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      started_date: '',
      due_date: '',
      input_file_url: '',
      output_file_url: '',
      is_active: true,
      assignee_ids: [],
    },
  });

  // Get task type from form for filtering assignees
  const taskType = useWatch({ control, name: 'task_type' });

  // Fetch projects
  const { data: projectsData } = useProjects({ limit: 1000, is_active: true });

  // Fetch task types (reusable endpoint - no roles:read permission required)
  const { data: taskTypesData } = useTaskTypes();
  
  // Get task type names from the response
  const taskTypes = taskTypesData?.map((role) => role.name) || [];

  // Fetch users with Designer/Developer/Marketing roles using the list endpoint (no permission required)
  const { data: usersList } = useUsersList({ is_active: true });

  useEffect(() => {
    if (projectsData?.data) {
      setProjects(projectsData.data);
      setLoadingProjects(false);
    }
  }, [projectsData]);

  // Filter assignees based on task type (from form or task data)
  useEffect(() => {
    if (usersList) {
      // Use taskType from form, or fallback to task.task_type if form hasn't been populated yet
      const currentTaskType = taskType || task?.task_type;
      
      if (currentTaskType) {
        // Filter users based on selected task type - match by role name (case-insensitive)
        const filteredUsers = usersList.filter((u) => {
          if (!u.roles || u.roles.length === 0) return false;
          return u.roles.some((role) => role.name.toLowerCase() === currentTaskType.toLowerCase());
        });
        setAssignableUsers(filteredUsers);
      } else {
        // No task type selected, show no users
        setAssignableUsers([]);
      }
      setLoadingUsers(false);
    }
  }, [usersList, taskType, task?.task_type]);

  const canUpdate = hasPermission('tasks:update');
  const canSetDueDate = hasPermission('tasks:update') || hasPermission('projects:update'); // Project Manager/Admin
  const isAssignee = task?.assignees?.some((a) => a.user_id === user?.id) || false;
  const canEdit = canUpdate || isAssignee; // Task assignees can also edit
  const canSetInputFile = canUpdate; // PM/Admin only
  const canSetOutputFile = isAssignee || canUpdate; // Assignees or PM/Admin

  // Populate form when task data loads
  useEffect(() => {
    if (!task || isLoadingTask) return;
  
    // Helper function to format date for input field
    const formatDateForInput = (date: string | Date | null | undefined): string => {
      if (!date) return '';
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const formData: UpdateTaskFormData = {
      project_id: task.project_id || '',
      title: task.title || '',
      task_type: task.task_type || '',
      description: task.description || '',
      priority: (task.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
      status: (task.status || 'TODO') as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
      started_date: formatDateForInput(task.started_date),
      due_date: formatDateForInput(task.due_date),
      input_file_url: task.input_file_url || '',
      output_file_url: task.output_file_url || '',
      is_active: task.is_active ?? true,
      assignee_ids: task.assignees?.map(a => a.user_id).filter(Boolean) || [],
    };

    console.log('Resetting form with task data:', task);
    console.log('Form data to reset:', formData);
  
    reset(formData);
  }, [task, isLoadingTask, reset]);

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to edit this task.</p>
        </div>
      </div>
    );
  }

  if (isLoadingTask) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading task..." />
      </div>
    );
  }

  if (taskError) {
    return (
      <div className="space-y-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">
            {taskError instanceof Error ? taskError.message : 'Failed to load task'}
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">Task not found.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: UpdateTaskFormData) => {
    const submitData: any = {
      title: data.title,
      task_type: data.task_type,
      description: data.description || null,
      priority: data.priority,
      status: data.status,
      started_date: data.started_date || null,
      is_active: data.is_active,
      assignee_ids: data.assignee_ids || [],
    };

    // Only allow Project Manager/Admin to update project_id and due_date
    if (canUpdate) {
      if (data.project_id !== undefined) submitData.project_id = data.project_id;
      if (canSetDueDate && data.due_date !== undefined) {
        submitData.due_date = data.due_date || null;
      }
      if (data.input_file_url !== undefined) {
        submitData.input_file_url = data.input_file_url || null;
      }
    } else {
      // Assignees can only update started_date, not due_date
      if (data.started_date !== undefined) {
        submitData.started_date = data.started_date || null;
      }
    }

    // Output file URL can be set by assignees or PM/Admin
    if (canSetOutputFile && data.output_file_url !== undefined) {
      submitData.output_file_url = data.output_file_url || null;
    }

    updateTask(
      { id: taskId, data: submitData },
      {
        onSuccess: () => {
          router.push('/tasks');
        },
      }
    );
  };

  const getUserDisplayName = (user: User): string => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.username;
  };
console.log(task,'----task')
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/tasks">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Task</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Update task information</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Task Information</CardTitle>
          <CardDescription>Update the task details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            
            {/* Project Selection - Only Project Manager/Admin can change */}
            {canUpdate && (
              <div className="space-y-2">
                <Label htmlFor="project_id">Project</Label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => {
                    // Use field.value if available, otherwise fallback to task data
                    const value = field.value || task?.project_id || '';
                    return (
                      <Select
                        value={value}
                        onValueChange={field.onChange}
                        disabled={isPending || isLoadingTask || loadingProjects}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.project_id && (
                  <p className="text-sm text-destructive">{errors.project_id.message}</p>
                )}
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                {...register('title')}
                disabled={isPending || isLoadingTask}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="task_type">Task Type *</Label>
              <Controller
                name="task_type"
                control={control}
                render={({ field }) => {
                  // Use field.value if it's set (even if empty string), otherwise fallback to task data
                  const value = field.value || task?.task_type || '';
                  // const value = field.value !== undefined && field.value !== null 
                  //   ? field.value 
                  //   : (task?.task_type || '');
                  return (
                    <Select
                      value={value}
                      onValueChange={field.onChange}
                      disabled={isPending || isLoadingTask}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.task_type && (
                <p className="text-sm text-destructive">{errors.task_type.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={isPending || isLoadingTask}
                placeholder="Describe the task..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => {
                    // Use field.value if it's set, otherwise fallback to task data or default
                    const value = field.value !== undefined && field.value !== null 
                      ? field.value 
                      : (task?.priority || 'MEDIUM');
                    return (
                      <Select
                        value={value}
                        onValueChange={field.onChange}
                        disabled={isPending || isLoadingTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    // Use field.value if it's set, otherwise fallback to task data or default
                    const value = field.value !== undefined && field.value !== null 
                      ? field.value 
                      : (task?.status || 'TODO');
                    return (
                      <Select
                        value={value}
                        onValueChange={field.onChange}
                        disabled={isPending || isLoadingTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="started_date">Start Date</Label>
                <Input
                  id="started_date"
                  type="date"
                  {...register('started_date')}
                  disabled={isPending}
                />
                {errors.started_date && (
                  <p className="text-sm text-destructive">{errors.started_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">
                  Due Date {canSetDueDate ? '' : '(Project Manager/Admin only)'}
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                  disabled={isPending || isLoadingTask || !canSetDueDate}
                />
                {errors.due_date && (
                  <p className="text-sm text-destructive">{errors.due_date.message}</p>
                )}
              </div>
            </div>

            {/* File URLs */}
            <div className="space-y-4">
              {canSetInputFile && (
                <div className="space-y-2">
                  <Label htmlFor="input_file_url">
                    Input File URL (PM/Admin only) <span className="text-muted-foreground text-xs">(PSD, DOC, FIGMA, ZIP, etc.)</span>
                  </Label>
                  <Input
                    id="input_file_url"
                    type="url"
                    {...register('input_file_url')}
                    disabled={isPending || isLoadingTask}
                    placeholder="https://example.com/files/design.psd"
                  />
                  {errors.input_file_url && (
                    <p className="text-sm text-destructive">{errors.input_file_url.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="output_file_url">
                  Output File URL (Assignee) <span className="text-muted-foreground text-xs">(Edited/final file)</span>
                </Label>
                <Input
                  id="output_file_url"
                  type="url"
                  {...register('output_file_url')}
                  disabled={isPending || isLoadingTask || !canSetOutputFile}
                  placeholder="https://example.com/files/final-design.psd"
                />
                {errors.output_file_url && (
                  <p className="text-sm text-destructive">{errors.output_file_url.message}</p>
                )}
                {!canSetOutputFile && (
                  <p className="text-xs text-muted-foreground">Only assigned users or PM/Admin can set the output file URL</p>
                )}
              </div>
            </div>

            {/* Task Assignee - Single selection based on task type - Only Project Manager/Admin can change */}
            {canUpdate && (
              <div className="space-y-2">
                <Label>Task Assignee {(taskType || task?.task_type) ? `(${taskType || task?.task_type})` : '(Select task type first)'}</Label>
                <Controller
                  name="assignee_ids"
                  control={control}
                  render={({ field }) => {
                    // For single select, we'll store as array with one item (to match API structure)
                    // Use field.value if it's set, otherwise fallback to task assignees
                    const fieldValue = field.value !== undefined && field.value !== null ? field.value : [];
                    const taskAssigneeIds = task?.assignees?.map(a => a.user_id).filter(Boolean) || [];
                    const assigneeArray = fieldValue.length > 0 ? fieldValue : taskAssigneeIds;
                    const selectedId = assigneeArray.length > 0 ? assigneeArray[0] : '';
                    
                    // Use taskType from form or fallback to task data
                    const currentTaskType = taskType || task?.task_type;
                    
                    return (
                      <div className="space-y-2">
                        {!currentTaskType ? (
                          <p className="text-sm text-muted-foreground">
                            Please select a task type first to see available assignees.
                          </p>
                        ) : assignableUsers.length > 0 ? (
                          <Select
                            value={selectedId}
                            onValueChange={(value) => {
                              // Store as array with single item to match API structure
                              field.onChange(value ? [value] : []);
                            }}
                            disabled={isPending || isLoadingTask || loadingUsers}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${currentTaskType} assignee...`} />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {getUserDisplayName(user)} ({user.roles?.[0]?.name || 'No role'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No {currentTaskType} users available for assignment.
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                {errors.assignee_ids && (
                  <p className="text-sm text-destructive">{errors.assignee_ids.message}</p>
                )}
              </div>
            )}

            {/* Active Status - Only Project Manager/Admin */}
            {canUpdate && (
              <div className="space-y-2">
                <Label htmlFor="is_active" className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    {...register('is_active')}
                    disabled={isPending || isLoadingTask}
                    className="h-4 w-4"
                  />
                  Active
                </Label>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/tasks">
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Task
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
