'use client';

import { useEffect, useState } from 'react';
import UserNav from './UserNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/users': 'Users',
  '/roles': 'Roles',
  '/contact-types': 'Contact Types',
  '/permissions': 'Permissions',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [title, setTitle] = useState('Dashboard');
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    // Get initial pathname from window.location (avoids router context issues)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      setPathname(currentPath);
      setTitle(routeTitles[currentPath] || 'Dashboard');
    }
  }, []);

  // Listen to navigation changes via popstate (browser back/forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      setPathname(currentPath);
      setTitle(routeTitles[currentPath] || 'Dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to Next.js client-side navigation by checking pathname periodically
  // This is a fallback for programmatic navigation that doesn't trigger popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPathname = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== pathname) {
        setPathname(currentPath);
        setTitle(routeTitles[currentPath] || 'Dashboard');
      }
    };

    // Check every 200ms (reasonable balance between responsiveness and performance)
    const interval = setInterval(checkPathname, 200);

    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Page Title */}
        <h1 className="text-lg font-semibold flex-1">{title}</h1>

        {/* User Navigation */}
        <UserNav />
      </div>
    </header>
  );
}
