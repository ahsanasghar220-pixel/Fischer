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
 * Get image src, converting to webp if needed.
 * Returns the fallback if provided, otherwise undefined when no image is set.
 */
export function getImageSrc(imagePath: string | null | undefined, fallback?: string): string | undefined {
  if (!imagePath) return fallback

  return toWebP(imagePath) || fallback
}
