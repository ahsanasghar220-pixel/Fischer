/**
 * Category image fallback map.
 * Used ONLY when the database has no image set for a category.
 * The database image always takes priority.
 */

const FALLBACK_IMAGE_MAP: Record<string, string> = {
  'kitchen-hoods':         '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
  'kitchen-hobs':          '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
  'cooking-ranges':        '/images/products/cooking-ranges/fcr-5bb.webp',
  'air-fryers':            '/images/products/air-fryers/FAF-801WD/1.webp',
  'water-coolers':         '/images/products/water-coolers/SKU FE 35 S.S.webp',
  'geysers-water-heaters': '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp',
  'oven-toasters':         '/images/products/oven-toasters/FOT-2501C/1.webp',
  'water-dispensers':      '/images/products/water-dispensers/1.webp',
  'accessories':           '/images/products/accessories/fac-bl2.webp',
}

/**
 * Resolve a category image.
 * 1. Database image (existingImage from API) — always first
 * 2. Hardcoded fallback map — only if DB has no image
 * 3. Returns undefined if neither is available
 */
export function getCategoryProductImage(slug: string, existingImage?: string | null): string | undefined {
  // Database image takes priority — it reflects the actual category setup
  if (existingImage) return existingImage

  // Hardcoded fallback only when DB has no image at all
  const normalizedSlug = slug?.toLowerCase() || ''
  return FALLBACK_IMAGE_MAP[normalizedSlug]
}
