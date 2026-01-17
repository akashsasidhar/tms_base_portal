// Permissions constants - will sync with backend
export const PERMISSIONS = {
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  ROLES: {
    CREATE: 'roles:create',
    READ: 'roles:read',
    UPDATE: 'roles:update',
    DELETE: 'roles:delete',
  },
  PERMISSIONS: {
    READ: 'permissions:read',
  },
  CONTACTS: {
    CREATE: 'contacts:create',
    READ: 'contacts:read',
    UPDATE: 'contacts:update',
    DELETE: 'contacts:delete',
  },
  CONTACT_TYPES: {
    CREATE: 'contact-types:create',
    READ: 'contact-types:read',
    UPDATE: 'contact-types:update',
    DELETE: 'contact-types:delete',
  },
} as const;
