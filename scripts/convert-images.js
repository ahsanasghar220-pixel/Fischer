/**
 * convert-images.js
 *
 * Converts product JPG images from:
 *   frontend/public/images/product images final/1 website data/{Category}/{SKU}/{n}.jpg
 *
 * To WebP in:
 *   frontend/public/images/products/{category-slug}/{sku}/{n}.webp
 *
 * Also generates thumbnails at:
 *   frontend/public/images/products/{category-slug}/{sku}/{n}-thumb.webp
 *
 * Usage:
 *   node scripts/convert-images.js
 *   node scripts/convert-images.js --dry-run   (show what would be done without writing files)
 *
 * Requires: sharp (in frontend/node_modules/sharp)
 */

const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

// Use sharp from frontend/node_modules since that's where it's installed
const sharpPath = path.join(__dirname, '..', 'frontend', 'node_modules', 'sharp')
const sharp = require(sharpPath)

const DRY_RUN = process.argv.includes('--dry-run')

// ── Category folder name → output slug ──────────────────────────────────────
const CATEGORY_MAP = {
  'AirFryers': 'air-fryers',
  'Blender': 'accessories',
  'Cooking Ranges': 'cooking-ranges',
  'Kitchen Hob': 'kitchen-hobs',
  'Kitchen Hood': 'kitchen-hoods',
  'Oven Toaster': 'oven-toasters',
  'Water Dispensers': 'water-dispensers',
  'water cooler': 'water-coolers',
  'Water Heater': 'water-heaters',  // inside "water heater all/"
}

const ROOT = path.join(__dirname, '..', 'frontend', 'public', 'images')
const INPUT_BASE = path.join(ROOT, 'product images final', '1 website data')
const OUTPUT_BASE = path.join(ROOT, 'products')

// Image conversion settings
const MAIN_SIZE = 800
const THUMB_SIZE = 400
const MAIN_QUALITY = 85
const THUMB_QUALITY = 75

// ── Gather all JPG files ──────────────────────────────────────────────────────

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

// ── Resolve category slug from file path ─────────────────────────────────────

function resolveCategorySlug(filePath) {
  // filePath is relative to INPUT_BASE
  // e.g. "AirFryers/FAF-401WD/1.jpg"
  //      "water heater all/Water Heater/FWH-R30D/1.jpg"
  const parts = filePath.split(path.sep)
  const topFolder = parts[0]
  if (CATEGORY_MAP[topFolder]) return CATEGORY_MAP[topFolder]

  // Check nested (e.g. "water heater all" → look at subfolder)
  if (parts.length >= 2 && CATEGORY_MAP[parts[1]]) return CATEGORY_MAP[parts[1]]

  // Fallback: slugify the folder name
  return topFolder.toLowerCase().replace(/\s+/g, '-')
}

// ── Resolve SKU folder from file path ────────────────────────────────────────

function resolveSkuFolder(filePath) {
  const parts = filePath.split(path.sep)
  // SKU is always the second-to-last segment (before the filename)
  return parts[parts.length - 2]
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🖼  Fischer Image Converter${DRY_RUN ? ' [DRY RUN]' : ''}\n`)
  console.log(`Input:  ${INPUT_BASE}`)
  console.log(`Output: ${OUTPUT_BASE}\n`)

  const allFiles = walkDir(INPUT_BASE)
  const jpgFiles = allFiles.filter(f => /\.(jpg|jpeg|png)$/i.test(f))

  console.log(`Found ${jpgFiles.length} image files.\n`)

  let converted = 0
  let skipped = 0
  let errors = 0

  for (const srcPath of jpgFiles) {
    const relPath = path.relative(INPUT_BASE, srcPath)
    const categorySlug = resolveCategorySlug(relPath)
    const skuFolder = resolveSkuFolder(relPath)
    const baseName = path.basename(srcPath, path.extname(srcPath))

    const outDir = path.join(OUTPUT_BASE, categorySlug, skuFolder.toLowerCase())
    const mainOut = path.join(outDir, `${baseName}.webp`)
    const thumbOut = path.join(outDir, `${baseName}-thumb.webp`)

    console.log(`  ${relPath}`)
    console.log(`  → ${path.relative(ROOT, mainOut)}`)

    if (DRY_RUN) {
      converted++
      continue
    }

    try {
      fs.mkdirSync(outDir, { recursive: true })

      // Convert main image
      await sharp(srcPath)
        .resize(MAIN_SIZE, MAIN_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: MAIN_QUALITY })
        .toFile(mainOut)

      // Convert thumbnail
      await sharp(srcPath)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toFile(thumbOut)

      converted++
    } catch (err) {
      console.error(`  ✗ ERROR: ${err.message}`)
      errors++
    }
  }

  console.log(`\n─────────────────────────────`)
  console.log(`✓ Converted: ${converted}`)
  if (skipped) console.log(`  Skipped:   ${skipped}`)
  if (errors) console.log(`✗ Errors:    ${errors}`)
  console.log(`\nOutput: ${OUTPUT_BASE}`)
  console.log('\nDone! You can now upload these images via the Admin → Products image manager.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
