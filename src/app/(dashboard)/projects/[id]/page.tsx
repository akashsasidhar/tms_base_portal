'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FolderKanban, Calendar, User as UserIcon, UserCheck } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDateDisplay } from '@/utils/date.util';
import { getUserDisplayName } from '@/utils/user.util';
import { usePermissions } from '@/hooks/usePermissions';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(params.id);
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('projects:update');

  // Redirect if ID is "new" or not a valid UUID
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      if (params.id === 'new') {
        router.replace('/projects/new');
      } else {
        router.replace('/projects');
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
        <LoadingSpinner size="lg" text="Loading project details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load project details. Please try again.</p>
        </div>
      </div>
    );
  }

  const creatorName = project.created_by_user
    ? getUserDisplayName(project.created_by_user)
    : 'Unknown';

  const projectManagerName = project.project_manager
    ? getUserDisplayName(project.project_manager)
    : null;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{project.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Project Details</p>
        </div>
        {canUpdate && (
          <Link href={`/projects/${project.id}/edit`}>
            <Button>
              Edit Project
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Project details and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project Name</label>
              <p className="text-base font-medium">{project.name}</p>
            </div>
            {project.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={project.is_active ? 'default' : 'secondary'}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline
            </CardTitle>
            <CardDescription>Start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.start_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-base">{formatDateDisplay(project.start_date)}</p>
              </div>
            )}
            {project.end_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-base">{formatDateDisplay(project.end_date)}</p>
              </div>
            )}
            {!project.start_date && !project.end_date && (
              <p className="text-muted-foreground">No dates set</p>
            )}
          </CardContent>
        </Card>

        {/* Project Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Project Manager
            </CardTitle>
            <CardDescription>Assigned project manager</CardDescription>
          </CardHeader>
          <CardContent>
            {projectManagerName ? (
              <p className="text-base">{projectManagerName}</p>
            ) : (
              <p className="text-muted-foreground italic">Not assigned (Admin will handle)</p>
            )}
          </CardContent>
        </Card>

        {/* Created By */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Created By
            </CardTitle>
            <CardDescription>User who created this project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base">{creatorName}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
