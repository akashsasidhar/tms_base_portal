'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/role.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Users, Key, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatRoleName } from '@/lib/role-utils';
import type { Role } from '@/types/role.types';
import { useAuth } from '@/hooks/useAuth';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RoleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('super_admin');
  const { data, isLoading, error } = useQuery({
    queryKey: ['role', params.id],
    queryFn: () => roleService.getById(params.id),
    enabled: params.id !== 'new' && UUID_REGEX.test(params.id),
  });

  // Redirect if ID is "new" or not a valid UUID
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      if (params.id === 'new') {
        router.replace('/roles/new');
      } else {
        router.replace('/roles');
      }
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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading role details..." />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="space-y-6">
        <Link href="/roles">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load role details. Please try again.</p>
        </div>
      </div>
    );
  }

  const role: Role = data.data.data || data.data;

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
        <h1 className="text-2xl sm:text-3xl font-bold break-words">{formatRoleName(role.name)}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Role Details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Role details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role Name</label>
              <p className="text-base font-medium">{formatRoleName(role.name)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base">{role.description || <span className="text-muted-foreground">No description</span>}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={role.is_active ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                  {role.is_active ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role ID</label>
              <p className="text-base font-mono text-sm">{role.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistics
            </CardTitle>
            <CardDescription>Role usage information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Users with this Role</label>
              <p className="text-base font-medium">
                {role.users_count !== undefined ? role.users_count : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permissions</label>
              <p className="text-base font-medium">
                {role.permissions_count !== undefined ? role.permissions_count : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions - Only visible to Super Admin */}
        {isSuperAdmin && role.permissions && role.permissions.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>{role.permissions.length} permission(s) assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission.id} variant="outline">
                    {permission.resource}:{permission.action}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
