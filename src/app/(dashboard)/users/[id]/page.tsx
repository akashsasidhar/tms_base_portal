'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Shield, Calendar, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ContactBadge from '@/components/common/ContactBadge';
import RoleBadge from '@/components/common/RoleBadge';
import { formatDateDetailed } from '@/utils/date.util';
import type { UserContact } from '@/types/auth.types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(params.id);

  // Redirect if ID is "new" or not a valid UUID
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      if (params.id === 'new') {
        router.replace('/users/new');
      } else {
        router.replace('/users');
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
        <LoadingSpinner size="lg" text="Loading user details..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link href="/users">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load user details. Please try again.</p>
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
      <Link href="/users">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold break-words">{displayName}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">User Details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>User account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-base font-medium">{user.username}</p>
            </div>
            {user.first_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                <p className="text-base">{user.first_name}</p>
              </div>
            )}
            {user.last_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <p className="text-base">{user.last_name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={user.is_active ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                  {user.is_active ? (
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
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-base font-mono text-sm">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>{user.contacts.length} contact(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {user.contacts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.contacts.map((contact) => (
                  <ContactBadge 
                    key={contact.id} 
                    contact={contact as UserContact} 
                    showType 
                    copyable 
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No contacts</p>
            )}
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
            <CardDescription>{user.roles.length} role(s) assigned</CardDescription>
          </CardHeader>
          <CardContent>
            {user.roles.length > 0 ? (
              <RoleBadge role={user.roles[0]} showTooltip />
            ) : (
              <p className="text-muted-foreground">No role assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
            <CardDescription>Account activity information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="text-base">
                {formatDateDetailed(user.created_at)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-base">
                {formatDateDetailed(user.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
