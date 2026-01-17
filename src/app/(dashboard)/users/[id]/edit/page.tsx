'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validation schema matching backend
const updateUserSchema = z.object({
  first_name: z.string().max(100, 'First name must not exceed 100 characters').optional().nullable(),
  last_name: z.string().max(100, 'Last name must not exceed 100 characters').optional().nullable(),
  is_active: z.boolean().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data: user, isLoading, error } = useUser(params.id);
  const updateUserMutation = useUpdateUser();

  const canUpdate = hasPermission('users:update');

  // Redirect if ID is invalid
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      router.replace('/users');
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
          <p className="text-destructive">You don't have permission to edit users.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      is_active: user?.is_active ?? true,
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUserMutation.mutateAsync({
        id: params.id,
        data: {
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          is_active: data.is_active,
        },
      });
      router.back();
    } catch (error) {
      // Error handled by useUpdateUser hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading user..." />
      </div>
    );
  }

  if (error || !user) {
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
          <p className="text-destructive">Failed to load user. Please try again.</p>
        </div>
      </div>
    );
  }

  const displayName = user.first_name || user.last_name
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.username;

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
        <h1 className="text-2xl sm:text-3xl font-bold">Edit User</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update information for {displayName}
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update the user's information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  disabled={updateUserMutation.isPending}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  disabled={updateUserMutation.isPending}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={watch('is_active') ?? user.is_active}
                onCheckedChange={(checked) => {
                  setValue('is_active', checked as boolean);
                }}
                disabled={updateUserMutation.isPending}
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
              disabled={updateUserMutation.isPending} 
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending} className="w-full sm:w-auto">
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
