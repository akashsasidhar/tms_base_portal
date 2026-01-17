'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import StatCard from '@/components/common/StatCard';
import { Users, Shield, UserCheck, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const { statistics, isLoading } = useDashboard();

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User';

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={statistics?.total_users ?? 0}
          icon={Users}
          loading={isLoading}
          description="All registered users"
        />
        <StatCard
          title="Total Roles"
          value={statistics?.total_roles ?? 0}
          icon={Shield}
          loading={isLoading}
          description="System roles"
        />
        <StatCard
          title="Active Users"
          value={statistics?.active_users ?? 0}
          icon={UserCheck}
          loading={isLoading}
          description="Currently active users"
        />
        <StatCard
          title="Total Contacts"
          value={statistics?.total_contacts ?? 0}
          icon={Mail}
          loading={isLoading}
          description="All user contacts"
        />
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent activity will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
