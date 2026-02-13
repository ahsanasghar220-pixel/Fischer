/**
 * Centralized category-to-product-image mapping.
 * Ensures every category on the homepage shows a real product photo
 * instead of SVG icons, emojis, or gradient placeholders.
 */

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  // Match paths from CategorySeeder.php
  'kitchen-hoods': '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
  'built-in-hoods': '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
  'kitchen-hobs': '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
  'built-in-hobs': '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
  'cooking-ranges': '/images/products/cooking-ranges/fcr-5bb.webp',
  'oven-toasters': '/images/products/oven-toasters/FOT-2501C/1.webp',
  'air-fryers': '/images/products/air-fryers/FAF-801WD/1.webp',
  'water-coolers': '/images/products/water-coolers/water-cooler-35ltr.webp',
  'slim-water-coolers': '/images/products/slim-water-coolers/fe-35-slim.webp',
  'storage-coolers': '/images/products/storage-coolers/fst-200.webp',
  'water-dispensers': '/images/products/water-dispensers/1.webp',
  'water-heaters': '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp',
  'fast-electric-water-heaters': '/images/products/fast-electric-water-heaters/ffeg-f100.webp',
  'instant-electric-water-heaters': '/images/products/instant-electric-water-heaters/fiewhs-25l.webp',
  'hybrid-geysers': '/images/products/hybrid-geysers/fhg-65g.webp',
  'accessories': '/images/products/accessories/fac-bl2.webp',
  // Legacy aliases
  'geysers-heaters': '/images/products/hybrid-geysers/fhg-65g.webp',
  'hobs-hoods': '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
  'blenders-processors': '/images/products/accessories/fac-bl3.webp',
}

// Keywords from slugs for fuzzy matching - using correct paths from CategorySeeder
const SLUG_KEYWORDS: Array<[string[], string]> = [
  [['water', 'cooler'], '/images/products/water-coolers/water-cooler-35ltr.webp'],
  [['cooking', 'range'], '/images/products/cooking-ranges/fcr-5bb.webp'],
  [['geyser', 'heater'], '/images/products/hybrid-geysers/fhg-65g.webp'],
  [['hob'], '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp'],
  [['hood'], '/images/products/kitchen-hoods/FKH-H90-06S/1.webp'],
  [['dispenser'], '/images/products/water-dispensers/1.webp'],
  [['storage', 'cooler'], '/images/products/storage-coolers/fst-200.webp'],
  [['oven', 'toaster'], '/images/products/oven-toasters/FOT-2501C/1.webp'],
  [['air', 'fryer'], '/images/products/air-fryers/FAF-801WD/1.webp'],
  [['blender'], '/images/products/accessories/fac-bl3.webp'],
  [['electric', 'water', 'heater'], '/images/products/instant-electric-water-heaters/fiewhs-25l.webp'],
  [['hybrid'], '/images/products/hybrid-geysers/fhg-65g.webp'],
  [['freezer'], '/images/products/storage-coolers/fst-200.webp'],
  [['slim'], '/images/products/slim-water-coolers/fe-35-slim.webp'],
  [['accessor'], '/images/products/accessories/fac-bl2.webp'],
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
