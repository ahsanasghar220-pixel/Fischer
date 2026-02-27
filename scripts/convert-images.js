/**
 * convert-images.js
 *
 * Converts product JPG images from:
 *   frontend/public/images/product images final/1 website data/{Category}/{SKU}/{n}.jpg
 *
 * To WebP in:
 *   frontend/public/images/products/{category-slug}/{sku}/{n}.webp  (SKU-based products)
 *   frontend/public/images/products/{category-slug}/{name}.webp    (flat named products)
 *
 * Usage:
 *   node scripts/convert-images.js
 *   node scripts/convert-images.js --dry-run   (show what would be done without writing files)
 *
 * Requires: sharp (in frontend/node_modules/sharp)
 */

const path = require('path')
const fs = require('fs')

// Use sharp from frontend/node_modules since that's where it's installed
const sharpPath = path.join(__dirname, '..', 'frontend', 'node_modules', 'sharp')
const sharp = require(sharpPath)

const DRY_RUN = process.argv.includes('--dry-run')

// ── Category folder name → output slug ──────────────────────────────────────
// For SKU-based categories (sub-folder = SKU code)
const CATEGORY_MAP = {
  'AirFryers':       'air-fryers',
  'Blender':         'accessories',
  'Cooking Ranges':  'cooking-ranges',
  'Kitchen Hob':     'kitchen-hobs',
  'Kitchen Hood':    'kitchen-hoods',
  'Oven Toaster':    'oven-toasters',
}

// ── Flat-file categories (no SKU subfolder, files live directly in category dir) ──
// These categories output to products/{slug}/{filename}.webp
const FLAT_CATEGORY_MAP = {
  'Water Dispensers': 'water-dispensers',
  'water cooler':     'water-coolers',
}

// ── Water heater images: map filename → correct category slug ────────────────
// All water heater images are flat files inside "water heater all/Water Heater/"
const WATER_HEATER_FILENAME_MAP = {
  'Eco Watt Series Electric Water Heater':                   'water-heaters',
  'Fischer Fast Electric Water Heater F-30 Liter':           'fast-electric-water-heaters',
  'Fischer Fast Electric Geyser F-100 Liter':                'fast-electric-water-heaters',
  'Fischer Fast Electric Geyser F-140 Liter':                'fast-electric-water-heaters',
  'Fischer Fast Electric Geyser F-200 Liter':                'fast-electric-water-heaters',
  'Fischer Hybrid (Electric Gas Geyser) 25 Gallon':          'hybrid-geysers',
  'Fischer Hybrid (Electric Gas Geyser) 35 Gallon':          'hybrid-geysers',
  'Fischer Hybrid (Electric Gas Geyser) 55 Gallon':          'hybrid-geysers',
  'Fischer Hybrid (Electric Gas Geyser) 100 Gallon Heavy Duty': 'hybrid-geysers',
  'Gas Geyser 35 Gallon':                                    'hybrid-geysers',
  'Gas Geyser 55 Gallon':                                    'hybrid-geysers',
  'Instant Cum Storage Electric Water Heater \u2013 10 Litr': 'instant-electric-water-heaters',
  'Instant Cum Storage Electric Water Heater \u2013 15 Litr': 'instant-electric-water-heaters',
  'Instant Cum Storage Electric Water Heater \u2013 30 Litr': 'instant-electric-water-heaters',
  'Instant Electric Water Heater with Storage 20 Ltrs':      'instant-electric-water-heaters',
  'Instant Electric Water Heater with Storage 25 Ltrs':      'instant-electric-water-heaters',
  'Instant Gas Water Heater':                                'hybrid-geysers',
}

const ROOT = path.join(__dirname, '..', 'frontend', 'public', 'images')
const INPUT_BASE = path.join(ROOT, 'product images final', '1 website data')
const OUTPUT_BASE = path.join(ROOT, 'products')

// Image conversion settings
const MAIN_SIZE = 800
const MAIN_QUALITY = 85

// ── Gather all image files ────────────────────────────────────────────────────

function walkDir(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(full))
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      results.push(full)
    }
  }
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n  Fischer Image Converter${DRY_RUN ? ' [DRY RUN]' : ''}\n`)
  console.log(`Input:  ${INPUT_BASE}`)
  console.log(`Output: ${OUTPUT_BASE}\n`)

  const allFiles = walkDir(INPUT_BASE)
  console.log(`Found ${allFiles.length} image files.\n`)

  let converted = 0
  let errors = 0

  for (const srcPath of allFiles) {
    const relPath = path.relative(INPUT_BASE, srcPath)
    const parts = relPath.split(path.sep)
    const topFolder = parts[0]
    const baseName = path.basename(srcPath, path.extname(srcPath))

    let outPath

    // ── Water heater images: flat files, route by filename ────────────────
    if (topFolder === 'water heater all') {
      const categorySlug = WATER_HEATER_FILENAME_MAP[baseName]
      if (!categorySlug) {
        console.warn(`  SKIP (unknown water heater): ${relPath}`)
        continue
      }
      outPath = path.join(OUTPUT_BASE, categorySlug, `${baseName}.webp`)

    // ── Flat-file categories (water cooler, water dispensers) ─────────────
    } else if (FLAT_CATEGORY_MAP[topFolder]) {
      const categorySlug = FLAT_CATEGORY_MAP[topFolder]
      outPath = path.join(OUTPUT_BASE, categorySlug, `${baseName}.webp`)

    // ── SKU-based categories (air fryers, hobs, hoods, ovens, etc.) ───────
    } else if (CATEGORY_MAP[topFolder]) {
      const categorySlug = CATEGORY_MAP[topFolder]
      // SKU folder is always the parent directory of the image file
      const skuFolder = parts[parts.length - 2].toLowerCase()
      const outDir = path.join(OUTPUT_BASE, categorySlug, skuFolder)
      outPath = path.join(outDir, `${baseName}.webp`)

    } else {
      console.warn(`  SKIP (unknown category): ${relPath}`)
      continue
    }

    const relOut = path.relative(ROOT, outPath)
    console.log(`  ${relPath}\n  → ${relOut}`)

    if (DRY_RUN) {
      converted++
      continue
    }

    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true })

      await sharp(srcPath)
        .resize(MAIN_SIZE, MAIN_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: MAIN_QUALITY })
        .toFile(outPath)

      converted++
      console.log(`  ✓\n`)
    } catch (err) {
      console.error(`  ✗ ERROR: ${err.message}\n`)
      errors++
    }
  }

  console.log(`─────────────────────────────`)
  console.log(`✓ Converted: ${converted}`)
  if (errors) console.log(`✗ Errors:    ${errors}`)
  console.log(`\nOutput: ${OUTPUT_BASE}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
