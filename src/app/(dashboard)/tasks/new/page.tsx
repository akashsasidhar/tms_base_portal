'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
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
import type { Project } from '@/types/project.types';
import type { User } from '@/types/user.types';

// Validation schema
const createTaskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID').min(1, 'Project is required'),
  title: z.string().min(1, 'Task title is required').max(255, 'Task title must not exceed 255 characters'),
  task_type: z.string().min(1, 'Task type is required'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional().default('TODO'),
  started_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
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

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

const TASK_TYPES = ['Designer', 'Developer', 'Marketing'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;

export default function NewTaskPage() {
  const router = useRouter();
  const { mutate: createTask, isPending } = useCreateTask();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const canCreate = hasPermission('tasks:create');
  const canSetDueDate = hasPermission('tasks:update') || hasPermission('projects:update'); // Project Manager/Admin

  // Fetch projects
  const { data: projectsData } = useProjects({ limit: 1000, is_active: true });

  // Fetch users with Designer/Developer/Marketing roles
  const { data: usersData } = useUsers({ limit: 1000, is_active: true });

  useEffect(() => {
    if (projectsData?.data) {
      setProjects(projectsData.data);
      setLoadingProjects(false);
    }
  }, [projectsData]);

  useEffect(() => {
    if (usersData?.data) {
      // Filter users by role: Designer, Developer, Marketing
      const filteredUsers = usersData.data.filter((u) => {
        if (!u.roles || u.roles.length === 0) return false;
        return u.roles.some(
          (role) =>
            role.name.toLowerCase() === 'designer' ||
            role.name.toLowerCase() === 'developer' ||
            role.name.toLowerCase() === 'marketing'
        );
      });
      setAssignableUsers(filteredUsers);
      setLoadingUsers(false);
    }
  }, [usersData]);

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to create tasks.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      project_id: '',
      title: '',
      task_type: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      started_date: '',
      due_date: '',
      assignee_ids: [],
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    const submitData = {
      project_id: data.project_id,
      title: data.title,
      task_type: data.task_type,
      description: data.description || null,
      priority: data.priority,
      status: data.status,
      started_date: data.started_date || null,
      due_date: canSetDueDate ? (data.due_date || null) : null,
      assignee_ids: data.assignee_ids || [],
    };

    createTask(submitData, {
      onSuccess: () => {
        router.push('/tasks');
      },
    });
  };

  const getUserDisplayName = (user: User): string => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.username;
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Task</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Add a new task to track and manage</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Task Information</CardTitle>
          <CardDescription>Enter the task details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending || loadingProjects}
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
                )}
              />
              {errors.project_id && (
                <p className="text-sm text-destructive">{errors.project_id.message}</p>
              )}
            </div>

            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                {...register('title')}
                disabled={isPending}
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
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                disabled={isPending}
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
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
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
                  )}
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
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
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
                  )}
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
                  disabled={isPending || !canSetDueDate}
                />
                {errors.due_date && (
                  <p className="text-sm text-destructive">{errors.due_date.message}</p>
                )}
              </div>
            </div>

            {/* Task Assignees - Multiple selection */}
            <div className="space-y-2">
              <Label>Task Assignees (Designer/Developer/Marketing)</Label>
              <Controller
                name="assignee_ids"
                control={control}
                render={({ field }) => {
                  const selectedIds = field.value || [];
                  return (
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !selectedIds.includes(value)) {
                            field.onChange([...selectedIds, value]);
                          }
                        }}
                        disabled={isPending || loadingUsers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add assignee..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableUsers
                            .filter((user) => !selectedIds.includes(user.id))
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {getUserDisplayName(user)} ({user.roles?.[0]?.name || 'No role'})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedIds.map((userId) => {
                            const user = assignableUsers.find((u) => u.id === userId);
                            if (!user) return null;
                            return (
                              <Badge
                                key={userId}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {getUserDisplayName(user)}
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(selectedIds.filter((id) => id !== userId));
                                  }}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {errors.assignee_ids && (
                <p className="text-sm text-destructive">{errors.assignee_ids.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/tasks">
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
