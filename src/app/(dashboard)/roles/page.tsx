'use client';

import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Shield, Pencil, MoreHorizontal, Eye } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatRoleName } from '@/lib/role-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error } = useRoles({ 
    name: search || undefined,
    page,
    limit,
  });

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('roles:create');
  const canRead = hasPermission('roles:read');
  const canUpdate = hasPermission('roles:update');

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Roles</h1>
        <p className="text-muted-foreground">You don't have permission to view roles.</p>
      </div>
    );
  }

  // Extract roles from paginated response
  // Backend returns: { success: true, data: Role[], meta: {...} }
  const roles = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Roles</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage system roles and permissions</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
        <div className="relative flex-1 sm:flex-initial sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        {canCreate && (
          <Link href="/roles/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Role</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading roles..." />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load roles. Please try again.</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No roles found.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role: any) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{formatRoleName(role.name)}</TableCell>
                  <TableCell>
                    {role.description || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {role.users_count !== undefined ? (
                      <Badge variant="secondary">{role.users_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {role.permissions_count !== undefined ? (
                      <Badge variant="secondary">{role.permissions_count}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/roles/${role.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        {canUpdate && (
                          <DropdownMenuItem asChild>
                            <Link href={`/roles/${role.id}/edit`} className="flex items-center">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.meta.total)} of{' '}
            {data.meta.total} roles
          </p>
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 sm:flex-initial"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.meta!.total_pages, p + 1))}
              disabled={page >= data.meta!.total_pages}
              className="flex-1 sm:flex-initial"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
