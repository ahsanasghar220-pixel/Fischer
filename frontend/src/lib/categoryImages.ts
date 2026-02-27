/**
 * Resolve a category image from the database.
 * No hardcoded fallbacks — admins must set category images via the admin panel.
 */
export function getCategoryProductImage(_slug: string, existingImage?: string | null): string | undefined {
  return existingImage || undefined
}
