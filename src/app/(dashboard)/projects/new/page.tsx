'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/useProjects';
import { useUsersList } from '@/hooks/useUsers';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types/user.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Validation schema
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must not exceed 255 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional().nullable(),
  project_manager_id: z.string().uuid('Invalid project manager ID').optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
}).refine(
  (data) => {
    // If both dates are provided, end_date should be after start_date
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject();
  const { hasPermission } = usePermissions();
  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);

  const canCreate = hasPermission('projects:create');

  // Fetch users with Project Manager role using the list endpoint (no permission required)
  const { data: usersList } = useUsersList({ is_active: true });

  useEffect(() => {
    if (usersList) {
      // Filter users by Project Manager role
      const filteredUsers = usersList.filter((u) => {
        if (!u.roles || u.roles.length === 0) return false;
        return u.roles.some(
          (role) => role.name.toLowerCase() === 'project manager'
        );
      });
      setProjectManagers(filteredUsers);
      setLoadingManagers(false);
    }
  }, [usersList]);

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to create projects.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      project_manager_id: null,
      start_date: '',
      end_date: '',
    },
  });

  const getUserDisplayName = (user: User): string => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.username;
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    const submitData = {
      name: data.name,
      description: data.description || null,
      project_manager_id: data.project_manager_id || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    };

    createProject(submitData, {
      onSuccess: () => {
        router.push('/projects');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Project</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Add a new project to track and manage</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Enter the project details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isPending}
                placeholder="My Awesome Project"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={isPending}
                placeholder="Describe your project..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Project Manager Selection */}
            <div className="space-y-2">
              <Label htmlFor="project_manager_id">Project Manager (Optional)</Label>
              <Controller
                name="project_manager_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    disabled={isPending || loadingManagers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Admin will handle)</SelectItem>
                      {projectManagers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {getUserDisplayName(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project_manager_id && (
                <p className="text-sm text-destructive">{errors.project_manager_id.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                If no project manager is assigned, admin will handle the project
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  disabled={isPending}
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  disabled={isPending}
                />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/projects">
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
