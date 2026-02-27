/**
 * Centralized category-to-product-image mapping.
 * Ensures every category on the homepage shows a real product photo
 * instead of SVG icons, emojis, or gradient placeholders.
 *
 * Exactly 9 flat categories — no sub-categories.
 */

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'kitchen-hoods':        '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
  'kitchen-hobs':         '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
  'cooking-ranges':       '/images/products/cooking-ranges/fcr-5bb.webp',
  'air-fryers':           '/images/products/air-fryers/FAF-801WD/1.webp',
  'water-coolers':        '/images/products/water-coolers/SKU FE 35 S.S.webp',
  'geysers-water-heaters':'/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp',
  'oven-toasters':        '/images/products/oven-toasters/FOT-2501C/1.webp',
  'water-dispensers':     '/images/products/water-dispensers/1.webp',
  'accessories':          '/images/products/accessories/fac-bl2.webp',
}

// Keywords from slugs for fuzzy matching — last-resort fallback
const SLUG_KEYWORDS: Array<[string[], string]> = [
  [['water', 'cooler'],   '/images/products/water-coolers/SKU FE 35 S.S.webp'],
  [['cooking', 'range'],  '/images/products/cooking-ranges/fcr-5bb.webp'],
  [['geyser'],            '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp'],
  [['heater'],            '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp'],
  [['hob'],               '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp'],
  [['hood'],              '/images/products/kitchen-hoods/FKH-H90-06S/1.webp'],
  [['dispenser'],         '/images/products/water-dispensers/1.webp'],
  [['oven', 'toaster'],   '/images/products/oven-toasters/FOT-2501C/1.webp'],
  [['air', 'fryer'],      '/images/products/air-fryers/FAF-801WD/1.webp'],
  [['accessor'],          '/images/products/accessories/fac-bl2.webp'],
]

/**
 * Resolve a real product image for a category.
 * 1. Prefer the local fallback map (always has correct, verified paths)
 * 2. Falls back to existingImage from the API if no map entry found
 * 3. Fuzzy keyword match as last resort
 * 4. Returns undefined if no match
 */
export function getCategoryProductImage(slug: string, existingImage?: string | null): string | undefined {
  const normalizedSlug = slug?.toLowerCase() || ''

  // Exact match from our verified map takes priority
  if (CATEGORY_IMAGE_MAP[normalizedSlug]) {
    return CATEGORY_IMAGE_MAP[normalizedSlug]
  }

  // Fuzzy match: check if slug contains any keyword set
  for (const [keywords, image] of SLUG_KEYWORDS) {
    if (keywords.every(kw => normalizedSlug.includes(kw))) {
      return image
    }
  }

  // Fall back to API-provided image if no local mapping found
  if (existingImage) return existingImage

  return undefined
}
