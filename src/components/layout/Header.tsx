'use client';

import { usePathname } from 'next/navigation';
import UserNav from './UserNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/roles': 'Roles',
  '/contact-types': 'Contact Types',
  '/permissions': 'Permissions',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] || 'Dashboard';

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
