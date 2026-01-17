'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRole, useUpdateRole } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validation schema matching backend
const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(100, 'Role name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Role name can only contain letters, numbers, and underscores')
    .optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
  is_active: z.boolean().optional(),
});

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

export default function EditRolePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data, isLoading, error } = useRole(params.id);
  const updateRoleMutation = useUpdateRole();

  const canUpdate = hasPermission('roles:update');

  // Redirect if ID is invalid
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      router.replace('/roles');
    }
  }, [params.id, router]);

  // Don't render if ID is invalid
  if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to edit roles.</p>
        </div>
      </div>
    );
  }

  const role = data?.data?.data || data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      is_active: role?.is_active ?? true,
    },
  });

  // Reset form when role data loads
  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        description: role.description || '',
        is_active: role.is_active ?? true,
      });
    }
  }, [role, reset]);

  const onSubmit = async (data: UpdateRoleFormData) => {
    try {
      await updateRoleMutation.mutateAsync({
        id: params.id,
        data: {
          name: data.name,
          description: data.description || null,
          is_active: data.is_active,
        },
      });
      router.back();
    } catch (error) {
      // Error handled by useUpdateRole hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading role..." />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load role. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Role</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Update role information</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Update the role details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={updateRoleMutation.isPending}
                placeholder="admin, user, manager"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, and underscores are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={updateRoleMutation.isPending}
                placeholder="Describe the role's purpose and responsibilities"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Maximum 500 characters
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={watch('is_active') ?? role.is_active}
                onCheckedChange={(checked) => {
                  setValue('is_active', checked as boolean);
                }}
                disabled={updateRoleMutation.isPending}
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              disabled={updateRoleMutation.isPending} 
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoleMutation.isPending} className="w-full sm:w-auto">
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
