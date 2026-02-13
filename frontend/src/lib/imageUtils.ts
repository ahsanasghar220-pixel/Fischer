/**
 * Utility to transform image URLs to use .webp format
 * Handles conversion from .png, .jpg, .jpeg to .webp
 */
export function toWebP(imagePath: string | null | undefined): string | undefined {
  if (!imagePath) return undefined

  // Convert .png, .jpg, .jpeg to .webp
  return imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
}

/**
 * Get image with webp fallback
 */
export function getImageSrc(imagePath: string | null | undefined, fallback?: string): string {
  if (!imagePath) return fallback || '/images/placeholder.webp'

  return toWebP(imagePath) || fallback || '/images/placeholder.webp'
}
