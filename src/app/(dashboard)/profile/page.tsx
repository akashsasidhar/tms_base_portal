"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ContactBadge from "@/components/common/ContactBadge";
import RoleBadge from "@/components/common/RoleBadge";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, isLoading, hasRole } = useAuth();
  const { hasPermission, permissions } = usePermissions();
  const canUpdate = hasPermission("users:update");
  const isSuperAdmin = hasRole("super_admin");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : user.username;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">My Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your account information
          </p>
        </div>
        {canUpdate && (
          <Link href={`/users/${user.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-base font-medium">{user.username}</p>
            </div>

            {/* First & Last Name Row */}
            {(user.first_name || user.last_name) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            )}
            {/* <div>
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
            </div> */}
            {user.created_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="text-base">{format(new Date(user.created_at), "MMMM d, yyyy")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contacts
            </CardTitle>
            <CardDescription>
              {user.contacts.length} contact{user.contacts.length < 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.contacts.length > 0 ? (
              <div className="space-y-2">
                {user.contacts.map(contact => (
                  <ContactBadge key={contact.id} contact={contact} showType copyable />
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
            <CardDescription>
              {user.roles.length > 0 ? "Role assigned" : "No role assigned"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.roles.length > 0 ? (
              <RoleBadge role={user.roles[0]} showTooltip />
            ) : (
              <p className="text-muted-foreground">No role assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions - Only visible to Super Admin */}
        {isSuperAdmin && permissions && permissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>Your system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
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
