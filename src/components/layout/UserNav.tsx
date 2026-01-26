'use client';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import RoleBadge from '@/components/common/RoleBadge';
import ContactBadge from '@/components/common/ContactBadge';
import { LogOut, User, Settings, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;
  
  // Use window.location for navigation to avoid router context issues
  // This works even in error boundaries where router context might not be available
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase();
  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  const handleLogout = async () => {
    try {
      // Wait for logout to complete (clears cookies on backend)
      await logout();
      // Small delay to ensure cookies are processed by browser
      await new Promise(resolve => setTimeout(resolve, 100));
      // Use full page reload to ensure cookies are cleared and middleware sees the change
      // This is necessary because HTTP-only cookies are cleared by the backend response
      window.location.href = '/login';
    } catch (error) {
      // Even if logout fails, ensure redirect happens with full page reload
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = '/login';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.username}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Primary Contact */}
        {user.contacts.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Primary Contact
            </DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <ContactBadge contact={user.contacts.find((c) => c.is_primary) || user.contacts[0]} />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* All Contacts */}
        {user.contacts.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              All Contacts
            </DropdownMenuLabel>
            <div className="px-2 py-1.5 space-y-1">
              {user.contacts.map((contact) => (
                <ContactBadge key={contact.id} contact={contact} />
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Role */}
        {user.roles.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Role
            </DropdownMenuLabel>
            <div className="px-2 py-1.5">
              <RoleBadge role={user.roles[0]} />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Menu Items */}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/change-password')}>
          <KeyRound className="mr-2 h-4 w-4" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
