'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatRoleName } from '@/lib/role-utils';
import type { Role } from '@/types/auth.types';

interface RoleBadgeProps {
  role: Role;
  variant?: 'default' | 'outline';
  showTooltip?: boolean;
}

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-red-500/10 text-red-700 border-red-500/20',
  'super admin': 'bg-red-500/10 text-red-700 border-red-500/20',
 'Admin': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
 'User': 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

const RoleBadge = memo(function RoleBadge({
  role,
  variant = 'default',
  showTooltip = true,
}: RoleBadgeProps) {
  const formattedName = formatRoleName(role.name);
  const colorClass = roleColors[role.name.toLowerCase()] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';

  const badge = (
    <Badge
      variant={variant}
      className={cn(
        variant === 'default' && colorClass,
        'border'
      )}
    >
      {formattedName}
    </Badge>
  );

  if (showTooltip && role.description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{formattedName}</p>
            {role.description && <p className="text-xs mt-1">{role.description}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
});

export default RoleBadge;
