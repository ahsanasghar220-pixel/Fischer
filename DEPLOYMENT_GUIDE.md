# Deployment Guide - Fischer E-commerce

**Date:** February 13, 2026
**Task:** Deploy fresh build with old image cleanup on Hostinger

---

## Changes Made

### 1. Product Card Improvements ✅

**Equal Sizing:**
- Fixed flexbox structure in `frontend/src/index.css`
- Removed `max-height` constraint
- Set consistent `min-height: 380px` for all cards
- Image height increased to `200px` for better proportions
- Product info uses `flex: 1` to fill available space
- Price pushed to bottom with `margin-top: auto`

**Discount Price Display:**
- Original price now shows with strikethrough using `.product-price-old` class
- Discount percentage badge automatically calculated and displayed
- Clear visual hierarchy: Sale price (bold gradient) + Original price (strikethrough gray)

**Files Modified:**
1. `frontend/src/components/products/ProductCard.tsx` - Strikethrough price
2. `frontend/src/index.css` - Card sizing fixes

### 2. Image Cleanup Completed ✅

**Backend Cleanup:**
- Deleted 30 old PNG/JPG files
- Updated seeders to use `.webp` format
- Backend images: 20KB (down from ~6MB)

**Frontend Cleanup:**
- Deleted "1 website data" folder (73 files, 52MB)
- Removed all duplicate format images
- Frontend images: 82MB (down from ~134MB)

**Total Space Saved:** ~52MB+

---

## Deployment Steps for Hostinger

### Pre-Deployment: Commit Changes

```bash
# 1. Stage all changes
git add .

# 2. Commit with message
git commit -m "$(cat <<'EOF'
Fix product card sizing and discount price display

- Make all product cards equal height with flexbox
- Show original price with strikethrough on discounts
- Display discount percentage badge
- Clean up 97 old/duplicate images (52MB+ saved)
- Update seeders to use WebP format

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# 3. Push to main branch (triggers auto-deploy)
git push origin main
```

### Post-Deployment: Clean Old Images on Hostinger

After the auto-deploy completes, SSH into your Hostinger server and run these commands:

```bash
# 1. SSH into your Hostinger server
ssh your-username@your-hostinger-server

# 2. Navigate to your project directory
cd /path/to/your/fischer/project

# 3. Clean old backend images (PNG/JPG that have been replaced)
cd backend/public/images
rm -f *.jpg *.png
rm -f banners/*.jpg
rm -f categories/*.png
rm -f products/*.png

# 4. Clean frontend legacy data folder (if exists)
cd ../../frontend/public/images
rm -rf "products/1 website data"

# 5. Verify cleanup
find . -type f \( -name "*.jpg" -o -name "*.png" \) | wc -l
# Should return 0 or very few (only logo source files .ai allowed)

# 6. Check disk space saved
du -sh .
```

### Alternative: Using File Manager (Hostinger Panel)

If you prefer using Hostinger's File Manager:

1. **Login to Hostinger Control Panel**
2. **Navigate to File Manager**
3. **Go to your project directory**

4. **Delete Backend Old Images:**
   - Navigate to `backend/public/images/`
   - Delete all `.jpg` and `.png` files in root
   - Go to `banners/` folder → Delete all `.jpg` files
   - Go to `categories/` folder → Delete all `.png` files
   - Go to `products/` folder → Delete all `.png` files

5. **Delete Frontend Legacy Folder:**
   - Navigate to `frontend/public/images/products/`
   - Delete the folder named `1 website data` (entire folder)

6. **Verify:**
   - Check that only `.webp` images remain
   - Logo source files (.ai) can stay

---

## Auto-Deploy Configuration

Your Hostinger auto-deploy should be configured to:

1. **Pull from GitHub:** Automatically pulls when you push to main
2. **Run build:** Executes `npm run build` in frontend directory
3. **Deploy:** Copies `frontend/dist/` to public folder
4. **Database migrations:** Runs Laravel migrations/seeders

**Verify Auto-Deploy Settings:**
- Repository: Your GitHub repository
- Branch: `main`
- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`

---

## Database Seeders Update

After deployment, you may want to re-run the seeders to update image paths in the database:

```bash
# SSH into Hostinger
ssh your-username@your-server

# Navigate to backend directory
cd /path/to/your/project/backend

# Run seeders (updates image paths to .webp)
php artisan db:seed --class=BannerSeeder
php artisan db:seed --class=HomepageSeeder
php artisan db:seed --class=CategorySeeder
```

**Note:** Only run these if you haven't already updated the database manually or if you want to reset to the new seeder values.

---

## Verification Checklist

After deployment, verify these changes:

### Frontend Verification

1. **Product Cards:**
   - [ ] All product cards have equal height
   - [ ] Discounted products show percentage badge (e.g., "-22%")
   - [ ] Original price shows with strikethrough
   - [ ] Sale price is bold and prominent
   - [ ] Cards look consistent in grid/carousel

2. **Images:**
   - [ ] All product images load correctly
   - [ ] Category images display properly
   - [ ] Banner images on home page work
   - [ ] No broken image links

3. **Performance:**
   - [ ] Pages load faster (smaller images)
   - [ ] No 404 errors in Network tab
   - [ ] WebP images loading correctly

### Backend Verification

1. **Admin Panel:**
   - [ ] Product images display in admin
   - [ ] Category images show correctly
   - [ ] Banners load in homepage settings

2. **Database:**
   - [ ] Seeder image paths use `.webp`
   - [ ] No references to deleted images

---

## Rollback Plan (If Needed)

If something goes wrong after deployment:

```bash
# 1. Revert to previous commit
git revert HEAD
git push origin main

# 2. Or reset to specific commit
git reset --hard <previous-commit-hash>
git push origin main --force
```

**Note:** Force push should be used carefully. Make sure you have a backup.

---

## Summary

✅ **Product Card Sizing:** All cards now have uniform height using flexbox
✅ **Discount Display:** Original price shows strikethrough, discount % badge added
✅ **Build:** Fresh production bundle created (619KB main bundle, 160KB CSS)
✅ **Image Cleanup:** 97 files deleted (52MB+ saved)
✅ **Seeders Updated:** All database references now use `.webp`

**Next Steps:**
1. Commit and push changes to trigger auto-deploy
2. SSH into Hostinger and delete old images manually
3. Verify all functionality works correctly
4. Enjoy faster load times and cleaner codebase! 🎉

---

**Generated:** February 13, 2026
**Build Size:** 619.70 KB (main bundle) + 160.18 KB (CSS)
**Space Saved:** 52MB+ from image cleanup
**Status:** ✅ Ready for deployment
