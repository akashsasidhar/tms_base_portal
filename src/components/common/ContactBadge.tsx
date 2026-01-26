'use client';

import { memo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageSquare, CheckCircle2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UserContact } from '@/types/auth.types';

interface ContactBadgeProps {
  contact: UserContact;
  showType?: boolean;
  copyable?: boolean;
}

const contactIcons: Record<string, typeof Mail> = {
  email: Mail,
  mobile: Phone,
  phone: Phone,
  whatsapp: MessageSquare,
  telegram: MessageSquare,
};

const ContactBadge = memo(function ContactBadge({
  contact,
  showType = true,
  copyable = true,
}: ContactBadgeProps) {
  const Icon = contactIcons[contact?.contact_type?.toLowerCase()] || Mail;

  const handleCopy = useCallback(() => {
    if (!copyable) return;
    navigator.clipboard.writeText(contact.contact);
    toast.success('Contact copied to clipboard');
  }, [contact.contact, copyable]);

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-2 py-1',
        copyable && 'cursor-pointer hover:bg-accent transition-colors'
      )}
      onClick={handleCopy}
    >
      <Icon className="h-3 w-3" />
      <span>{contact.contact}</span>
      {showType && contact.contact_type && (
        <span className="text-xs text-muted-foreground ml-1">
          ({contact.contact_type})
        </span>
      )}
      {contact.is_verified && (
        <CheckCircle2 className="h-3 w-3 text-green-600" />
      )}
      {contact.is_primary && (
        <Star className="h-3 w-3 text-yellow-600 fill-yellow-600" />
      )}
    </Badge>
  );
});

export default ContactBadge;
