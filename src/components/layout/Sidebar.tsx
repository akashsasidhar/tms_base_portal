'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import RoleBadge from '@/components/common/RoleBadge';
import {
  Home,
  Users,
  Shield,
  Mail,
  Key,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  permission?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, permission: undefined },
  { href: '/projects', label: 'Projects', icon: FolderKanban, permission: 'projects:read' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, permission: 'tasks:read' },
  { href: '/users', label: 'Users', icon: Users, permission: 'users:read' },
  { href: '/roles', label: 'Roles', icon: Shield, permission: 'roles:read' },
  { href: '/contact-types', label: 'Contact Types', icon: Mail, permission: 'contact-types:read' },
  { href: '/permissions', label: 'Permissions', icon: Key, permission: 'permissions:read' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { user, permissions, logout } = useAuth();
  const router = useRouter();

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

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

  if (!user) return null;

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase();
  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  const primaryContact = user.contacts.find((c) => c.is_primary) || user.contacts[0];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo/App Name */}
        <div className={cn('p-4 border-b flex items-center justify-between')}>
          {!isCollapsed && <h1 className="text-xl font-bold">Admin Dashboard</h1>}
          {isCollapsed && <h1 className="text-xl font-bold mx-auto">A</h1>}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={toggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <TooltipProvider delayDuration={0}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const button = (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size={isCollapsed ? 'icon' : 'default'}
                    className={cn(
                      isCollapsed ? 'w-full justify-center' : 'w-full justify-start',
                      isActive && 'bg-accent'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                    {!isCollapsed && item.label}
                  </Button>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </TooltipProvider>
        </nav>

        {/* User Section */}
        <div className="p-2 border-t space-y-2">
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <Avatar className="cursor-pointer">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{displayName}</p>
                    {primaryContact && (
                      <p className="text-xs text-muted-foreground">{primaryContact.contact}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  {primaryContact && (
                    <p className="text-xs text-muted-foreground truncate">
                      {primaryContact.contact}
                    </p>
                  )}
                </div>
              </div>

              {/* Role */}
              {user.roles.length > 0 && !isCollapsed && (
                <div className="px-2">
                  <RoleBadge role={user.roles[0]} />
                </div>
              )}
            </>
          )}

          {/* Logout Button */}
          {isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
