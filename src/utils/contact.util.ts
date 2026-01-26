import type { UserContact } from '@/types/auth.types';

/**
 * Primary contact type names (various formats)
 */
const PRIMARY_EMAIL_TYPES = ['primary email', 'primary_email', 'email'] as const;
const PRIMARY_MOBILE_TYPES = ['primary mobile', 'primary_mobile', 'mobile', 'phone'] as const;

/**
 * Check if a contact type is a primary email type
 */
export function isPrimaryEmailType(contactType: string | null | undefined): boolean {
  if (!contactType) return false;
  const type = contactType.toLowerCase();
  return PRIMARY_EMAIL_TYPES.some((primaryType) => type === primaryType);
}

/**
 * Check if a contact type is a primary mobile type
 */
export function isPrimaryMobileType(contactType: string | null | undefined): boolean {
  if (!contactType) return false;
  const type = contactType.toLowerCase();
  return PRIMARY_MOBILE_TYPES.some((primaryType) => type === primaryType);
}

/**
 * Check if a contact type should be excluded from additional contacts
 */
export function isPrimaryContactType(contactType: string | null | undefined): boolean {
  return isPrimaryEmailType(contactType) || isPrimaryMobileType(contactType);
}

/**
 * Get primary email contact from contacts array
 */
export function getPrimaryEmailContact(
  contacts: UserContact[] | undefined
): UserContact | undefined {
  if (!contacts || contacts.length === 0) return undefined;
  return contacts.find((c) => {
    const type = c.contact_type?.toLowerCase();
    return (
      (isPrimaryEmailType(type) && c.is_primary) ||
      (type === 'email' && c.is_primary)
    );
  });
}

/**
 * Get primary mobile contact from contacts array
 */
export function getPrimaryMobileContact(
  contacts: UserContact[] | undefined
): UserContact | undefined {
  if (!contacts || contacts.length === 0) return undefined;
  return contacts.find((c) => {
    const type = c.contact_type?.toLowerCase();
    return (
      (isPrimaryMobileType(type) && c.is_primary) ||
      ((type === 'mobile' || type === 'phone') && c.is_primary)
    );
  });
}

/**
 * Get all primary email contacts (for duplicate detection)
 */
export function getAllPrimaryEmailContacts(
  contacts: UserContact[] | undefined
): UserContact[] {
  if (!contacts || contacts.length === 0) return [];
  return contacts.filter((c) => {
    const type = c.contact_type?.toLowerCase();
    return (
      (isPrimaryEmailType(type) && c.is_primary) ||
      (type === 'email' && c.is_primary)
    );
  });
}

/**
 * Get all primary mobile contacts (for duplicate detection)
 */
export function getAllPrimaryMobileContacts(
  contacts: UserContact[] | undefined
): UserContact[] {
  if (!contacts || contacts.length === 0) return [];
  return contacts.filter((c) => {
    const type = c.contact_type?.toLowerCase();
    return (
      (isPrimaryMobileType(type) && c.is_primary) ||
      ((type === 'mobile' || type === 'phone') && c.is_primary)
    );
  });
}

/**
 * Get primary email value
 */
export function getPrimaryEmail(contacts: UserContact[] | undefined): string {
  const emailContact = getPrimaryEmailContact(contacts);
  return emailContact?.contact || '';
}

/**
 * Get primary mobile value
 */
export function getPrimaryMobile(contacts: UserContact[] | undefined): string {
  const mobileContact = getPrimaryMobileContact(contacts);
  return mobileContact?.contact || '';
}

/**
 * Get additional contacts (excluding primary email and mobile)
 */
export function getAdditionalContacts(
  contacts: UserContact[] | undefined
): Array<{ id?: string; contact_type_id: string; contact: string }> {
  if (!contacts || contacts.length === 0) return [];
  return contacts
    .filter((c) => {
      const type = c.contact_type?.toLowerCase();
      return !isPrimaryContactType(type);
    })
    .map((c) => ({
      id: c.id,
      contact_type_id: c.contact_type_id,
      contact: c.contact,
    }));
}

/**
 * Filter contact types to exclude primary email and mobile
 */
export function filterNonPrimaryContactTypes(
  contactTypes: Array<{ id: string; contact_type: string }>
): Array<{ id: string; contact_type: string }> {
  return contactTypes.filter((type) => {
    const typeName = type.contact_type.toLowerCase();
    return !isPrimaryContactType(typeName);
  });
}

/**
 * Find contact type by name (case-insensitive)
 */
export function findContactTypeByName(
  contactTypes: Array<{ id: string; contact_type: string }>,
  name: string
): { id: string; contact_type: string } | undefined {
  return contactTypes.find(
    (t) => t.contact_type.toLowerCase() === name.toLowerCase()
  );
}
