/**
 * Centralized category-to-product-image mapping.
 * Ensures every category on the homepage shows a real product photo
 * instead of SVG icons, emojis, or gradient placeholders.
 */

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'water-coolers': '/images/products/water-coolers/fe-150-ss.png',
  'cooking-ranges': '/images/products/cooking-ranges/fcr-5bb.png',
  'geysers-heaters': '/images/products/hybrid-geysers/fhg-65g.png',
  'hobs-hoods': '/images/products/hob.png',
  'built-in-hobs': '/images/products/hob.png',
  'kitchen-hobs': '/images/products/kitchen-hobs/fbh-g90-5sbf.png',
  'water-dispensers': '/images/products/water-dispensers/fwd-fountain.png',
  'storage-coolers': '/images/products/storage-coolers/fst-200.png',
  'kitchen-hoods': '/images/products/kitchen-hoods/fkh-h90-06s.png',
  'built-in-hoods': '/images/products/kitchen-hoods/fkh-h90-06s.png',
  'oven-toasters': '/images/products/oven-toasters/fot-2501c-full.webp',
  'air-fryers': '/images/products/air-fryers/faf-801wd-backup.jpg',
  'blenders-processors': '/images/products/accessories/fac-bl3.png',
  'instant-electric-water-heaters': '/images/products/instant-electric-water-heaters/fiewhs-25l.png',
  'gas-water-heaters': '/images/products/gas-water-heaters/fgg-55g.png',
  'fast-electric-water-heaters': '/images/products/fast-electric-water-heaters/ffew-f50.png',
  'hybrid-geysers': '/images/products/hybrid-geysers/fhg-65g.png',
  'slim-water-coolers': '/images/products/slim-water-coolers/fe-35-slim.png',
  'accessories': '/images/products/accessories/fac-irn.png',
}

// Keywords from slugs for fuzzy matching
const SLUG_KEYWORDS: Array<[string[], string]> = [
  [['water', 'cooler'], '/images/products/water-coolers/fe-150-ss.png'],
  [['cooking', 'range'], '/images/products/cooking-ranges/fcr-5bb.png'],
  [['geyser', 'heater'], '/images/products/hybrid-geysers/fhg-65g.png'],
  [['hob'], '/images/products/hob.png'],
  [['hood'], '/images/products/kitchen-hoods/fkh-h90-06s.png'],
  [['dispenser'], '/images/products/water-dispensers/fwd-fountain.png'],
  [['storage', 'cooler'], '/images/products/storage-coolers/fst-200.png'],
  [['oven', 'toaster'], '/images/products/oven-toasters/fot-2501c-full.webp'],
  [['air', 'fryer'], '/images/products/air-fryers/faf-801wd-backup.jpg'],
  [['blender'], '/images/products/accessories/fac-bl3.png'],
  [['electric', 'water', 'heater'], '/images/products/instant-electric-water-heaters/fiewhs-25l.png'],
  [['gas', 'water', 'heater'], '/images/products/gas-water-heaters/fgg-55g.png'],
  [['freezer'], '/images/products/storage-coolers/fst-200.png'],
  [['slim'], '/images/products/slim-water-coolers/fe-35-slim.png'],
  [['accessor'], '/images/products/accessories/fac-irn.png'],
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
