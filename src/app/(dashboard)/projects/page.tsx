'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
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
import { Search, Plus, Loader2, MoreHorizontal, Eye, Pencil, Trash2, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteProject } from '@/hooks/useProjects';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useProjects({
    page,
    limit,
    search: search || undefined,
  });

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('projects:create');
  const canRead = hasPermission('projects:read');
  const canUpdate = hasPermission('projects:update');
  const canDelete = hasPermission('projects:delete');

  const deleteProject = useDeleteProject();

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">You don't have permission to view projects.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your projects and track their progress</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
        <div className="relative flex-1 sm:flex-initial sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        {canCreate && (
          <Link href="/projects/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading projects..." />
        </div>
      ) : error ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive font-medium">Failed to load projects.</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="text-center py-12">
          <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No projects found.</p>
          {canCreate && (
            <Link href="/projects/new" className="mt-4 inline-block">
              <Button variant="outline">Create your first project</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Project Manager</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((project) => {
                  const creatorName = project.created_by_user
                    ? `${project.created_by_user.first_name || ''} ${project.created_by_user.last_name || ''}`.trim() || project.created_by_user.username
                    : 'Unknown';

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {project.description || '-'}
                      </TableCell>
                      <TableCell>
                        {project.project_manager ? (
                          `${project.project_manager.first_name || ''} ${project.project_manager.last_name || ''}`.trim() || project.project_manager.username
                        ) : (
                          <span className="text-muted-foreground italic">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {project.start_date ? format(new Date(project.start_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {project.end_date ? format(new Date(project.end_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>{creatorName}</TableCell>
                      <TableCell>
                        <Badge variant={project.is_active ? 'default' : 'secondary'}>
                          {project.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/projects/${project.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            </Link>
                            {canUpdate && (
                              <Link href={`/projects/${project.id}/edit`}>
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(project.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.meta.total)} of {data.meta.total} projects
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.total_pages, p + 1))}
                  disabled={page >= data.meta.total_pages || isLoading}
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
