'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
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
import { Search, Plus, Loader2, MoreHorizontal, Eye, Pencil } from 'lucide-react';
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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useUsers({
    page,
    limit,
    search: search || undefined,
  });

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('users:create');
  const canRead = hasPermission('users:read');
  const canUpdate = hasPermission('users:update');

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">You don't have permission to view users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage system users and their access</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
        <div className="relative flex-1 sm:flex-initial sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        {canCreate && (
          <Link href="/users/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading users..." />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load users. Please try again.</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {user.contacts.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {user.contacts.slice(0, 2).map((contact) => (
                            <span key={contact.id} className="text-sm">
                              {contact.contact}
                            </span>
                          ))}
                          {user.contacts.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.contacts.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.roles.length > 0 ? (
                        <Badge variant="secondary">
                          {formatRoleName(user.roles[0].name)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
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
                            <Link href={`/users/${user.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {canUpdate && (
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user.id}/edit`} className="flex items-center">
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

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.meta.total)} of{' '}
                {data.meta.total} users
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
                  onClick={() => setPage((p) => Math.min(data.meta!.totalPages, p + 1))}
                  disabled={page >= data.meta!.totalPages}
                  className="flex-1 sm:flex-initial"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
