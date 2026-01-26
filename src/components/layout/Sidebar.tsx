'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ChevronDown,
  ChevronUp,
  FolderKanban,
  CheckSquare,
  Clock3,
  CheckCircle2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavSubItem {
  href: string;
  label: string;
  icon: typeof Home;
}

interface NavItem {
  href?: string;
  label: string;
  icon: typeof Home;
  permission?: string;
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, permission: undefined },
  { href: '/projects', label: 'Projects', icon: FolderKanban, permission: 'projects:read' },
  {
    label: 'Tasks',
    icon: CheckSquare,
    permission: 'tasks:read',
    subItems: [
      { href: '/tasks', label: 'Active', icon: CheckSquare },
      { href: '/tasks/pending', label: 'Pending', icon: Clock3 },
      { href: '/tasks/completed', label: 'Completed', icon: CheckCircle2 },
    ],
  },
  { href: '/users', label: 'Users', icon: Users, permission: 'users:read' },
  { href: '/roles', label: 'Roles', icon: Shield, permission: 'roles:read' },
  { href: '/contact-types', label: 'Contact Types', icon: Mail, permission: 'contact-types:read' },
  // { href: '/permissions', label: 'Permissions', icon: Key, permission: 'permissions:read' },
];

interface SidebarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ isOpen: controlledIsOpen, onOpenChange }: SidebarProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [pathname, setPathname] = useState<string>('');
  const { user, permissions, logout } = useAuth();
  const router = useRouter();
  
  // Safely get pathname - use window.location to avoid router context issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Listen to navigation changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    const checkPathname = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== pathname) {
        setPathname(currentPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    const interval = setInterval(checkPathname, 200);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, [pathname]);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

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

  // Check if a menu item or its sub-items are active
  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      // For exact href matches, check exact pathname or paths that start with href but are not sub-routes
      if (pathname === item.href) return true;
      // For /tasks, we need to be careful - it should only be active if we're on /tasks exactly
      // or on /tasks/new, /tasks/[id], etc., but NOT on /tasks/pending or /tasks/completed
      if (item.href === '/tasks') {
        return pathname === '/tasks' || 
               (pathname.startsWith('/tasks/') && 
                !pathname.startsWith('/tasks/pending') && 
                !pathname.startsWith('/tasks/completed'));
      }
      return pathname.startsWith(`${item.href}/`);
    }
    if (item.subItems) {
      return item.subItems.some((subItem) => isSubItemActive(subItem.href));
    }
    return false;
  };

  // Check if a sub-item is active - must match exactly or be a child route (but not sibling routes)
  const isSubItemActive = (href: string): boolean => {
    // Exact match
    if (pathname === href) return true;
    
    // For /tasks, it should only match /tasks exactly or /tasks/new, /tasks/[id], etc.
    // But NOT /tasks/pending or /tasks/completed
    if (href === '/tasks') {
      return pathname === '/tasks' || 
             (pathname.startsWith('/tasks/') && 
              !pathname.startsWith('/tasks/pending') && 
              !pathname.startsWith('/tasks/completed'));
    }
    
    // For /tasks/pending, match exactly or child routes like /tasks/pending/...
    if (href === '/tasks/pending') {
      return pathname === '/tasks/pending' || pathname.startsWith('/tasks/pending/');
    }
    
    // For /tasks/completed, match exactly or child routes
    if (href === '/tasks/completed') {
      return pathname === '/tasks/completed' || pathname.startsWith('/tasks/completed/');
    }
    
    // For other routes, match exactly or child routes
    return pathname.startsWith(`${href}/`);
  };

  // Toggle sub-menu expansion
  const toggleSubMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Auto-expand menu if any sub-item is active
  useEffect(() => {
    visibleNavItems.forEach((item) => {
      if (item.subItems && isItemActive(item)) {
        setExpandedMenus((prev) => new Set(prev).add(item.label));
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    // Call logout (it will handle redirect internally)
    await logout();
    // Fallback redirect in case logout doesn't redirect (shouldn't happen, but safety net)
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
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
          'fixed lg:static inset-y-0 left-0 z-50 bg-card border-r flex flex-col h-full transition-all duration-200',
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
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          <TooltipProvider delayDuration={0}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.has(item.label);

              // If item has sub-items, render as expandable menu
              if (hasSubItems) {
                // When collapsed, show dropdown menu
                if (isCollapsed) {
                  // Use a component to manage dropdown state per item
                  const CollapsedSubMenu = () => {
                    const [dropdownOpen, setDropdownOpen] = useState(false);
                    
                    return (
                      <DropdownMenu onOpenChange={setDropdownOpen}>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip open={dropdownOpen ? false : undefined}>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant={isActive ? 'secondary' : 'ghost'}
                                  size="icon"
                                  className={cn(
                                    'w-full justify-center',
                                    isActive && 'bg-accent'
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent side="right" align="start" className="w-48">
                          {item.subItems!.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = isSubItemActive(subItem.href);
                            return (
                              <DropdownMenuItem key={subItem.href} asChild>
                                <Link
                                  href={subItem.href}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    'flex items-center cursor-pointer',
                                    isSubActive && 'bg-accent'
                                  )}
                                >
                                  <SubIcon className="h-4 w-4 mr-2" />
                                  {subItem.label}
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  };
                  
                  return <CollapsedSubMenu key={item.label} />;
                }
                
                // When expanded, show inline sub-menu
                return (
                  <div key={item.label} className="space-y-1">
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="default"
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-accent'
                      )}
                      onClick={() => toggleSubMenu(item.label)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      )}
                    </Button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = isSubItemActive(subItem.href);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                            >
                              <Button
                                variant={isSubActive ? 'secondary' : 'ghost'}
                                size="sm"
                                className={cn(
                                  'w-full justify-start text-sm',
                                  isSubActive && 'bg-accent'
                                )}
                              >
                                <SubIcon className="h-3 w-3 mr-2" />
                                {subItem.label}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular menu item or collapsed state
              const button = item.href ? (
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
              ) : (
                <Button
                  key={item.label}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size={isCollapsed ? 'icon' : 'default'}
                  className={cn(
                    isCollapsed ? 'w-full justify-center' : 'w-full justify-start',
                    isActive && 'bg-accent'
                  )}
                  onClick={() => !isCollapsed && hasSubItems && toggleSubMenu(item.label)}
                >
                  <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                  {!isCollapsed && item.label}
                </Button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.label || item.href}>
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

        {/* User Section - Fixed at bottom */}
        <div className="p-2 border-t space-y-2 shrink-0">
          {isCollapsed ? (
            <>
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
            </>
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
              {user.roles.length > 0 && (
                <div className="px-2">
                  <RoleBadge role={user.roles[0]} />
                </div>
              )}

              {/* Logout Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </aside>

    </>
  );
}
