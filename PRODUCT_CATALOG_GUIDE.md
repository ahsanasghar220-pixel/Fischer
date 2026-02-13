# Product Catalog Migration Guide

**Date:** February 13, 2026
**Purpose:** Migrate product images to organized catalog structure

---

## What Was Done

### 1. Product Catalog Created ✅
- **Location:** `backend/public/images/product-catalog/`
- **Structure:** Organized by category → model → images
- **Total Images:** 73 WebP files (13MB)
- **Categories:** Air Fryers, Kitchen Hobs, Kitchen Hoods, Oven Toasters

### 2. New Seeder Created ✅
- **File:** `backend/database/seeders/ProductCatalogSeeder.php`
- **Purpose:** Seed products with multiple images from catalog
- **Features:**
  - Multiple images per product
  - Proper image paths from product-catalog
  - Creates or updates existing products

### 3. Migration Command Created ✅
- **File:** `backend/app/Console/Commands/MigrateProductCatalog.php`
- **Purpose:** Update existing products to use catalog images
- **Features:**
  - Dry-run mode to preview changes
  - Validates image files exist
  - Updates product_images table
  - Detailed progress reporting

---

## How to Use

### Method 1: Run the Catalog Seeder (Fresh Database)

If you want to seed products with catalog images from scratch:

```bash
# Navigate to backend
cd backend

# Run the catalog seeder
php artisan db:seed --class=ProductCatalogSeeder
```

**What it does:**
- Creates products if they don't exist
- Adds multiple images per product from catalog
- Uses organized product-catalog paths

### Method 2: Migrate Existing Products

If you already have products and want to update their images:

```bash
# Navigate to backend
cd backend

# DRY RUN - Preview changes without applying them
php artisan migrate:product-catalog --dry-run

# APPLY MIGRATION - Update images in database
php artisan migrate:product-catalog
```

**What it does:**
- Finds products by SKU
- Deletes old product images
- Adds new images from product-catalog
- Shows detailed summary

---

## Product Coverage

### Air Fryers (3 products, 6 images)
| SKU | Model | Images |
|-----|-------|--------|
| FAF-401WD | 4L Air Fryer | 2 |
| FAF-601WD | 6L Air Fryer | 2 |
| FAF-801WD | 8L Air Fryer | 2 |

### Kitchen Hobs (8 products, 17 images)
| SKU | Model | Images |
|-----|-------|--------|
| FBH-G78-3CB | Glass 3 Burner | 3 |
| FBH-G78-3CB-MATTE | Glass 3 Burner Matte | 1 |
| FBH-G90-5SBF | Glass 5 Burner | 3 |
| FBH-SS76-3CB | Steel 3 Burner | 1 |
| FBH-SS76-3EPS | Steel 3 Burner EPS | 3 |
| FBH-SS84-3SBF | Steel 3 Burner SABAF | 2 |
| FBH-SS86-3CB | Steel 3 Burner Premium | 3 |
| FBH-SS90-5SBF | Steel 5 Burner | 1 |

### Kitchen Hoods (6 products, 10 images)
| SKU | Model | Images |
|-----|-------|--------|
| FKH-H90-06S | Hood H Series | 1 |
| FKH-L90-01IN | Hood L Series Premium | 2 |
| FKH-S90-02IN | Slant Hood | 2 |
| FKH-T90-03IN | T-Shape Hood | 2 |
| FKH-T90-04SC | T-Shape Hood Premium | 1 |
| FKH-T90-05S | T-Shape Hood Standard | 1 |

### Oven Toasters (2 products, 8 images)
| SKU | Model | Images |
|-----|-------|--------|
| FOT-1901D | 35L Digital Oven | 4 |
| FOT-2501C | 48L Mechanical Oven | 4 |

---

## Image Path Format

All catalog images use this format:
```
/images/product-catalog/{category}/{model-sku}/{image-number}.webp
```

**Examples:**
```
/images/product-catalog/air-fryers/FAF-401WD/1.webp
/images/product-catalog/kitchen-hobs/FBH-G78-3CB/1.webp
/images/product-catalog/kitchen-hoods/FKH-L90-01IN/1.webp
/images/product-catalog/oven-toasters/FOT-1901D/1.webp
```

---

## Database Structure

### products table
- Standard product information
- SKU used as unique identifier

### product_images table
- Links to products via `product_id`
- `image`: Path to image file
- `is_primary`: First image is primary (true)
- `sort_order`: Order of images (0, 1, 2, ...)
- `alt_text`: Product name + image number

---

## Deployment Steps

### Local Testing

```bash
# 1. Test dry-run migration
php artisan migrate:product-catalog --dry-run

# 2. Review output, ensure all images found

# 3. Apply migration
php artisan migrate:product-catalog

# 4. Verify in database
php artisan tinker
>>> Product::where('sku', 'FAF-401WD')->first()->images->count()
# Should return 2
```

### Production Deployment

```bash
# After deploying to Hostinger via GitHub Actions

# 1. SSH into server
ssh your-username@your-server

# 2. Navigate to backend
cd /path/to/fischer/backend

# 3. Run migration
php artisan migrate:product-catalog

# 4. OR run catalog seeder
php artisan db:seed --class=ProductCatalogSeeder --force
```

---

## Troubleshooting

### Issue: "Product not found"
**Solution:** Product doesn't exist in database. Run ProductSeeder first or check SKU.

### Issue: "Image missing"
**Solution:** Image file doesn't exist at expected path. Check:
- File exists in `backend/public/images/product-catalog/`
- Path spelling matches exactly (case-sensitive)
- File extension is `.webp`

### Issue: "No images shown on frontend"
**Solution:** Check:
- API endpoint returns image URLs correctly
- Image paths are accessible via `/images/product-catalog/...`
- Frontend properly displays multiple images (carousel/gallery)

---

## Benefits of New Structure

✅ **Organization**
- Products grouped by category
- Each model in own folder
- Easy to find and manage

✅ **Multiple Images**
- 2-4 images per product
- Better product showcasing
- Enhanced user experience

✅ **Scalability**
- Easy to add new products
- Simple folder structure
- Clear naming convention

✅ **Performance**
- All WebP format (optimized)
- Smaller file sizes
- Faster loading

---

## Next Steps (Optional)

### 1. Add More Product Categories
- Water Coolers (27 images available)
- Water Dispensers (4 images available)
- Water Heaters (1 image available)

### 2. Frontend Updates
If needed, update frontend to display multiple images:
- Product detail image carousel
- Thumbnail gallery
- Zoom functionality

### 3. Admin Panel
Add multi-image upload in admin:
- Product edit form
- Image reordering
- Primary image selection

---

## Files Created

1. **Catalog Folder:**
   - `backend/public/images/product-catalog/` (73 images)

2. **Seeder:**
   - `backend/database/seeders/ProductCatalogSeeder.php`

3. **Migration Command:**
   - `backend/app/Console/Commands/MigrateProductCatalog.php`

4. **Documentation:**
   - `PRODUCT_CATALOG_REPORT.md` - Catalog structure and statistics
   - `PRODUCT_CATALOG_GUIDE.md` - This guide

---

## Support

For issues or questions:
1. Check this guide first
2. Review PRODUCT_CATALOG_REPORT.md for catalog details
3. Run migration with `--dry-run` to preview changes
4. Check Laravel logs: `backend/storage/logs/laravel.log`

---

**Generated:** February 13, 2026
**Status:** ✅ Ready for production
**Total Products:** 19 models
**Total Images:** 73 WebP files
