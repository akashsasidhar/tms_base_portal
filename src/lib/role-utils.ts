/**
 * Formats a role name from database format (e.g., "Super Admin", "admin") 
 * to display format (e.g., "Super Admin", "Admin")
 */
export function formatRoleName(roleName: string): string {
  if (!roleName) return '';
  
  // Replace underscores with spaces and split into words
  const words = roleName.replace(/_/g, ' ').split(' ');
  
  // Capitalize first letter of each word
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
