#!/bin/bash

# Fischer E-commerce Auto-Deployment Script
# This script runs automatically on Hostinger when you push to git

set -e  # Exit on any error

echo "🚀 Starting Fischer deployment..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# ========================================
# STEP 1: Clean Old Images (Backend)
# ========================================
echo "🧹 Cleaning old backend images..."

if [ -d "backend/public/images" ]; then
    cd backend/public/images

    # Remove old PNG/JPG files from root
    find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.png" \) -delete 2>/dev/null || true

    # Remove old banner JPG files
    if [ -d "banners" ]; then
        find banners -type f -name "*.jpg" -delete 2>/dev/null || true
    fi

    # Remove old category PNG files
    if [ -d "categories" ]; then
        find categories -type f -name "*.png" -delete 2>/dev/null || true
    fi

    # Remove old product PNG files
    if [ -d "products" ]; then
        find products -type f -name "*.png" -delete 2>/dev/null || true
    fi

    echo "✅ Backend images cleaned"
    cd "$SCRIPT_DIR"
else
    echo "⚠️  Backend images directory not found, skipping..."
fi

# ========================================
# STEP 2: Clean Old Images (Frontend)
# ========================================
echo "🧹 Cleaning old frontend images..."

if [ -d "frontend/public/images" ]; then
    cd frontend/public/images

    # Remove legacy "1 website data" folder if it exists
    if [ -d "products/1 website data" ]; then
        rm -rf "products/1 website data"
        echo "✅ Removed legacy '1 website data' folder"
    fi

    # Remove any remaining old format images (except logo source files)
    find . -type f \( -name "*.jpg" -o -name "*.jpeg" \) ! -path "*/logo/*" -delete 2>/dev/null || true
    find . -type f -name "*.png" ! -path "*/logo/*" ! -name "*.ai" -delete 2>/dev/null || true

    echo "✅ Frontend images cleaned"
    cd "$SCRIPT_DIR"
else
    echo "⚠️  Frontend images directory not found, skipping..."
fi

# ========================================
# STEP 3: Install Dependencies
# ========================================
echo "📦 Installing dependencies..."

if [ -d "frontend" ]; then
    cd frontend

    # Check if node_modules exists and package.json has changed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "Installing npm packages..."
        npm ci --production=false --silent
    else
        echo "Dependencies up to date, skipping install"
    fi

    cd "$SCRIPT_DIR"
fi

# ========================================
# STEP 4: Build Frontend
# ========================================
echo "🔨 Building frontend..."

if [ -d "frontend" ]; then
    cd frontend
    npm run build
    echo "✅ Frontend build complete"
    cd "$SCRIPT_DIR"
fi

# ========================================
# STEP 5: Backend Setup
# ========================================
echo "⚙️  Setting up backend..."

if [ -d "backend" ]; then
    cd backend

    # Install composer dependencies if needed
    if [ -f "composer.json" ]; then
        if [ ! -d "vendor" ] || [ "composer.json" -nt "vendor" ]; then
            echo "Installing composer packages..."
            composer install --no-dev --optimize-autoloader --no-interaction
        else
            echo "Composer dependencies up to date"
        fi
    fi

    # Clear Laravel caches
    echo "Clearing Laravel caches..."
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear

    # Optimize Laravel
    echo "Optimizing Laravel..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Run migrations (safe - only runs new migrations)
    echo "Running database migrations..."
    php artisan migrate --force

    # Seed roles & permissions (safe - uses firstOrCreate, idempotent)
    echo "Seeding roles & permissions..."
    php artisan db:seed --class=RolePermissionSeeder --force

    # Clear permission cache so Spatie picks up fresh data
    php artisan cache:clear

    echo "✅ Backend setup complete"
    cd "$SCRIPT_DIR"
fi

# ========================================
# STEP 6: Set Permissions
# ========================================
echo "🔐 Setting permissions..."

if [ -d "backend/storage" ]; then
    chmod -R 775 backend/storage
    chmod -R 775 backend/bootstrap/cache
fi

if [ -d "frontend/dist" ]; then
    chmod -R 755 frontend/dist
fi

# ========================================
# STEP 7: Cleanup Report
# ========================================
echo ""
echo "📊 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count remaining images
if [ -d "backend/public/images" ]; then
    BACKEND_JPG=$(find backend/public/images -type f -name "*.jpg" 2>/dev/null | wc -l)
    BACKEND_PNG=$(find backend/public/images -type f -name "*.png" 2>/dev/null | wc -l)
    echo "Backend old images: $BACKEND_JPG JPG, $BACKEND_PNG PNG"
fi

if [ -d "frontend/public/images" ]; then
    FRONTEND_JPG=$(find frontend/public/images -type f -name "*.jpg" 2>/dev/null | wc -l)
    FRONTEND_PNG=$(find frontend/public/images -type f -name "*.png" ! -name "*.ai" 2>/dev/null | wc -l)
    echo "Frontend old images: $FRONTEND_JPG JPG, $FRONTEND_PNG PNG"
fi

if [ -d "frontend/dist" ]; then
    DIST_SIZE=$(du -sh frontend/dist 2>/dev/null | cut -f1)
    echo "Build size: $DIST_SIZE"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment completed successfully!"
echo "🎉 Fischer E-commerce is now live!"
echo ""
