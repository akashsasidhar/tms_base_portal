'use client';

import { useState } from 'react';
import { useCompletedTasks } from '@/hooks/useTasks';
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
import { Search, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle2, CheckSquare, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteTask } from '@/hooks/useTasks';
import { format } from 'date-fns';

const priorityColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'destructive',
};

export default function CompletedTasksPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useCompletedTasks({
    page,
    limit,
    search: search || undefined,
  });

  const { hasPermission } = usePermissions();
  const canRead = hasPermission('tasks:read');
  const canUpdate = hasPermission('tasks:update');
  const canDelete = hasPermission('tasks:delete');

  const deleteTask = useDeleteTask();

  if (!canRead) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <p className="text-muted-foreground">You don't have permission to view tasks.</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Completed Tasks</h1>
        <p className="text-sm sm:text-base text-muted-foreground">All completed tasks</p>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        <Link
          href="/tasks"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
        >
          <CheckSquare className="inline mr-2 h-4 w-4" />
          Active
        </Link>
        <Link
          href="/tasks/pending"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground"
        >
          <Clock3 className="inline mr-2 h-4 w-4" />
          Pending
        </Link>
        <Link
          href="/tasks/completed"
          className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary"
        >
          <CheckCircle2 className="inline mr-2 h-4 w-4" />
          Completed
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
        <div className="relative flex-1 sm:flex-initial sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading completed tasks..." />
        </div>
      ) : error ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive font-medium">Failed to load completed tasks.</p>
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
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No completed tasks found.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assignees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((task) => {
                  const assigneeNames = task.assignees
                    ? task.assignees
                        .map((a) => {
                          const user = a.user;
                          if (!user) return null;
                          const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                          return name || user.username;
                        })
                        .filter(Boolean)
                        .join(', ')
                    : 'Unassigned';

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.project?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.task_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityColors[task.priority] || 'default'}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {assigneeNames || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tasks/${task.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem asChild>
                                <Link href={`/tasks/${task.id}/edit`} className="flex items-center">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(task.id)}
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
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.meta.total)} of {data.meta.total} tasks
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
