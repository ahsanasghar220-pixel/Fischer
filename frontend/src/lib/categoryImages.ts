/**
 * Centralized category-to-product-image mapping.
 * Ensures every category on the homepage shows a real product photo
 * instead of SVG icons, emojis, or gradient placeholders.
 */

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'water-coolers': '/images/products/water-coolers/fe-150-ss.webp',
  'cooking-ranges': '/images/products/cooking-ranges/fcr-5bb.webp',
  'geysers-heaters': '/images/products/hybrid-geysers/fhg-65g.webp',
  'hobs-hoods': '/images/products/hob.webp',
  'built-in-hobs': '/images/products/hob.webp',
  'kitchen-hobs': '/images/products/kitchen-hobs/fbh-g90-5sbf.webp',
  'water-dispensers': '/images/products/water-dispensers/fwd-fountain.webp',
  'storage-coolers': '/images/products/storage-coolers/fst-200.webp',
  'kitchen-hoods': '/images/products/kitchen-hoods/fkh-h90-06s.webp',
  'built-in-hoods': '/images/products/kitchen-hoods/fkh-h90-06s.webp',
  'oven-toasters': '/images/products/oven-toasters/fot-2501c-full.webp',
  'air-fryers': '/images/products/air-fryers/faf-801wd.webp',
  'blenders-processors': '/images/products/accessories/fac-bl3.webp',
  'instant-electric-water-heaters': '/images/products/instant-electric-water-heaters/fiewhs-25l.webp',
  'gas-water-heaters': '/images/products/gas-water-heaters/fgg-55g.webp',
  'fast-electric-water-heaters': '/images/products/fast-electric-water-heaters/ffew-f50.webp',
  'hybrid-geysers': '/images/products/hybrid-geysers/fhg-65g.webp',
  'slim-water-coolers': '/images/products/slim-water-coolers/fe-35-slim.webp',
  'accessories': '/images/products/accessories/fac-irn.webp',
}

// Keywords from slugs for fuzzy matching
const SLUG_KEYWORDS: Array<[string[], string]> = [
  [['water', 'cooler'], '/images/products/water-coolers/fe-150-ss.webp'],
  [['cooking', 'range'], '/images/products/cooking-ranges/fcr-5bb.webp'],
  [['geyser', 'heater'], '/images/products/hybrid-geysers/fhg-65g.webp'],
  [['hob'], '/images/products/hob.webp'],
  [['hood'], '/images/products/kitchen-hoods/fkh-h90-06s.webp'],
  [['dispenser'], '/images/products/water-dispensers/fwd-fountain.webp'],
  [['storage', 'cooler'], '/images/products/storage-coolers/fst-200.webp'],
  [['oven', 'toaster'], '/images/products/oven-toasters/fot-2501c-full.webp'],
  [['air', 'fryer'], '/images/products/air-fryers/faf-801wd.webp'],
  [['blender'], '/images/products/accessories/fac-bl3.webp'],
  [['electric', 'water', 'heater'], '/images/products/instant-electric-water-heaters/fiewhs-25l.webp'],
  [['gas', 'water', 'heater'], '/images/products/gas-water-heaters/fgg-55g.webp'],
  [['freezer'], '/images/products/storage-coolers/fst-200.webp'],
  [['slim'], '/images/products/slim-water-coolers/fe-35-slim.webp'],
  [['accessor'], '/images/products/accessories/fac-irn.webp'],
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
