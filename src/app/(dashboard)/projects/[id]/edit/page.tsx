'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { usePermissions } from '@/hooks/usePermissions';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Validation schema
const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must not exceed 255 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
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

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: project, isLoading: isLoadingProject } = useProject(params.id);
  const { mutate: updateProject, isPending } = useUpdateProject();
  const { hasPermission } = usePermissions();

  const canUpdate = hasPermission('projects:update');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  });

  // Populate form when project data loads
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
        is_active: project.is_active,
      });
    }
  }, [project, reset]);

  if (!canUpdate) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to edit projects.</p>
        </div>
      </div>
    );
  }

  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">Project not found.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: UpdateProjectFormData) => {
    const submitData = {
      name: data.name,
      description: data.description || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      is_active: data.is_active,
    };

    updateProject(
      { id: params.id, data: submitData },
      {
        onSuccess: () => {
          router.push('/projects');
        },
      }
    );
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
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Project</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Update project information</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Update the project details</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="is_active" className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  disabled={isPending}
                  className="h-4 w-4"
                />
                Active
              </Label>
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
              Update Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
