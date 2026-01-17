'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { roleService } from '@/services/role.service';

// Validation schema matching backend
const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(100, 'Role name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Role name can only contain letters, numbers, and underscores'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().nullable(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

export default function NewRolePage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = hasPermission('roles:create');

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Link href="/roles">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to create roles.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (data: CreateRoleFormData) => {
    setIsSubmitting(true);

    try {
      await roleService.create({
        name: data.name,
        description: data.description || null,
      });
      
      toast.success('Role created successfully');
      router.push('/roles');
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create role. Please try again.';
      toast.error(errorMessage);
      console.error('Role creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/roles">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Roles
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Role</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Add a new role to the system</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Enter the role details to create a new role</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Link href="/roles" className="w-full sm:w-auto">
              <Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
