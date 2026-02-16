# Fischer Pakistan - Hostinger Deployment Guide

## 🚀 Auto-Deployment Setup

### Prerequisites
- Git repository connected to Hostinger
- SSH access to Hostinger
- Database already created

---

## 📋 Deployment Steps

### 1. Backend Deployment

SSH into your Hostinger server and run:

```bash
# Navigate to project directory
cd ~/public_html/fischer  # or your project path

# Pull latest changes
git pull origin main

# Navigate to backend
cd backend

# Install/Update dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Run seeders (IMPORTANT - includes shipping methods)
php artisan db:seed --class=ShippingMethodsSeeder --force

# Clear and optimize cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### 2. Frontend Deployment

```bash
# Navigate to frontend
cd ~/public_html/fischer/frontend

# Install dependencies
npm install --production

# Build for production
npm run build
```

---

## 🗄️ Database Seeders Included

### ShippingMethodsSeeder
Creates default shipping methods:
- **Standard Delivery**: Rs 200 (3-5 days, free over Rs 10,000)
- **Express Delivery**: Rs 500 (1-2 days, free over Rs 15,000)
- Sets up Lahore zone with free shipping

**Run once after deployment:**
```bash
php artisan db:seed --class=ShippingMethodsSeeder --force
```

---

## 📦 What's Included in This Commit

### ✨ New Features
- ✅ Password Reset with email
- ✅ Shipping Management
- ✅ Sales System
- ✅ User Management
- ✅ Review System
- ✅ Coupon System
- ✅ Cart Sync Fix
- ✅ Stock Display Fix
- ✅ Video Optimization

### 🐛 Critical Fixes
- Fixed stock display (DB as single source of truth)
- Fixed cart empty error at checkout
- Fixed review submission errors
- Added shipping methods seeder
- Optimized hero video loading

---

## ⚠️ Post-Deployment Checklist

- [ ] Run migrations
- [ ] Run ShippingMethodsSeeder
- [ ] Clear caches
- [ ] Test checkout
- [ ] Compress hero video (see VIDEO-OPTIMIZATION.md)

