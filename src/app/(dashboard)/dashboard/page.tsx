'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/common/StatCard';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const { statistics, isLoading } = useDashboard();

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User';

  // Check if user is admin/PM
  const isAdmin = hasRole('Admin') || hasRole('Super Admin') || hasRole('Project Manager');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back, {displayName}!
        </p>
      </div>

      {/* Statistics Grid */}
      {isAdmin ? (
        // Admin/PM Dashboard
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Projects"
              value={statistics?.total_projects ?? 0}
              icon={FolderKanban}
              loading={isLoading}
              description="All projects"
            />
            <StatCard
              title="Active Projects"
              value={statistics?.active_projects ?? 0}
              icon={TrendingUp}
              loading={isLoading}
              description="Currently active"
            />
            <StatCard
              title="Total Tasks"
              value={statistics?.total_tasks ?? 0}
              icon={CheckSquare}
              loading={isLoading}
              description="All tasks"
            />
            <StatCard
              title="Active Tasks"
              value={statistics?.active_tasks ?? 0}
              icon={CheckSquare}
              loading={isLoading}
              description="In progress"
            />
            <StatCard
              title="Pending Tasks"
              value={statistics?.pending_tasks ?? 0}
              icon={Clock}
              loading={isLoading}
              description="Overdue tasks"
              variant="warning"
            />
            <StatCard
              title="Completed Tasks"
              value={statistics?.completed_tasks ?? 0}
              icon={CheckCircle2}
              loading={isLoading}
              description="Finished tasks"
              variant="success"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/projects/new">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                </Link>
                <Link href="/tasks/new">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Create New Task
                  </Button>
                </Link>
                <Link href="/tasks/pending">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    View Pending Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
                <CardDescription>Task status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Tasks</span>
                    <span className="text-sm font-medium">{statistics?.active_tasks ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Tasks</span>
                    <span className="text-sm font-medium text-orange-600">{statistics?.pending_tasks ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Tasks</span>
                    <span className="text-sm font-medium text-green-600">{statistics?.completed_tasks ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // User Dashboard (Developer, Designer, Marketing, etc.)
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="My Active Tasks"
              value={statistics?.my_active_tasks ?? 0}
              icon={CheckSquare}
              loading={isLoading}
              description="Tasks in progress"
            />
            <StatCard
              title="My Pending Tasks"
              value={statistics?.my_pending_tasks ?? 0}
              icon={AlertCircle}
              loading={isLoading}
              description="Overdue tasks"
              variant="warning"
            />
            <StatCard
              title="My Completed Tasks"
              value={statistics?.my_completed_tasks ?? 0}
              icon={CheckCircle2}
              loading={isLoading}
              description="Finished tasks"
              variant="success"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>View and manage your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/tasks">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    View Active Tasks
                  </Button>
                </Link>
                <Link href="/tasks/pending">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    View Pending Tasks
                  </Button>
                </Link>
                <Link href="/tasks/completed">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    View Completed Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Summary</CardTitle>
                <CardDescription>Your task statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Tasks</span>
                    <span className="text-sm font-medium">{statistics?.my_active_tasks ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Tasks</span>
                    <span className="text-sm font-medium text-orange-600">{statistics?.my_pending_tasks ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Tasks</span>
                    <span className="text-sm font-medium text-green-600">{statistics?.my_completed_tasks ?? 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Tasks</span>
                      <span className="text-sm font-bold">
                        {(statistics?.my_active_tasks ?? 0) + 
                         (statistics?.my_pending_tasks ?? 0) + 
                         (statistics?.my_completed_tasks ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
