# Fischer — Manual Deployment to Hostinger

This guide explains how to manually build and upload the Fischer app to Hostinger without relying on GitHub Actions.

---

## How the App is Structured on Hostinger

```
public_html/              ← Hostinger domain root (FTP_SERVER_DIR)
├── .htaccess             ← redirects all requests → public/
├── app/                  ← Laravel app code
├── bootstrap/
├── config/
├── database/
├── public/               ← Laravel public + React SPA lives here
│   ├── index.php         ← Laravel entry point
│   ├── index.html        ← React SPA entry (built by Vite)
│   ├── assets/           ← Vite-built JS/CSS bundles
│   ├── images/           ← product/banner/category images
│   └── .htaccess         ← handles API routing vs SPA routing
├── resources/
├── routes/
├── storage/
└── vendor/               ← Composer dependencies (stays on server)
```

The backend `vendor/` folder is NOT re-uploaded each time (it's huge). It stays on the server and only needs re-installation when `composer.json` changes.

---

## Step 1 — Build the Frontend Locally

Open a terminal in the project root:

```bash
cd frontend
npm install          # only needed if packages changed
npm run build
```

This creates `frontend/dist/` with the compiled React app (index.html + assets/).

---

## Step 2 — Create the Deployment Package

Create a temporary `deploy/` folder that mirrors what Hostinger expects:

**On Windows (PowerShell):**
```powershell
# From project root (c:\xampp\htdocs\fischer)

# Remove previous deploy folder if exists
Remove-Item -Recurse -Force deploy -ErrorAction SilentlyContinue

# Copy backend (Laravel) → deploy root
Copy-Item -Recurse backend\* deploy\ -Force

# IMPORTANT: Copy React build → deploy\public\ (this is what makes the SPA work)
Copy-Item -Recurse frontend\dist\* deploy\public\ -Force

# Remove things we don't upload
Remove-Item -Recurse -Force deploy\vendor -ErrorAction SilentlyContinue
Remove-Item -Force deploy\.env -ErrorAction SilentlyContinue
Remove-Item -Force deploy\.env.example -ErrorAction SilentlyContinue
Remove-Item -Force deploy\.env.production -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force deploy\tests -ErrorAction SilentlyContinue
Remove-Item -Force deploy\phpunit.xml -ErrorAction SilentlyContinue
```

**On Mac/Linux/Git Bash:**
```bash
# From project root
rm -rf deploy

mkdir -p deploy
cp -r backend/* deploy/
rsync -a frontend/dist/ deploy/public/

rm -rf deploy/vendor
rm -f  deploy/.env deploy/.env.example deploy/.env.production
rm -rf deploy/tests
rm -f  deploy/phpunit.xml
```

---

## Step 3 — Upload via FTP (FileZilla)

1. **Download FileZilla** (free): https://filezilla-project.org/

2. **Connect to Hostinger:**
   - Host: your Hostinger FTP hostname (e.g., `ftp.yourdomain.com` or the server IP)
   - Username: your Hostinger FTP username
   - Password: your Hostinger FTP password
   - Port: `21`

   > Find these in: Hostinger hPanel → Files → FTP Accounts

3. **Navigate on the server side** to your domain root:
   - Usually `public_html/` or `domains/yourdomain.com/public_html/`
   - This is the `FTP_SERVER_DIR` from your GitHub secrets

4. **Upload the deploy folder contents:**
   - Select ALL files/folders inside your local `deploy/` folder
   - Drag them to the server's `public_html/` (or your FTP_SERVER_DIR)
   - **Skip** uploading if the server already has a `vendor/` folder (ask to skip/overwrite only changed files)

> **Tip:** FileZilla will show transfer speed and progress. For ~50MB it takes a few minutes.

---

## Step 4 — Set Up the .env File on Hostinger

The `.env` file is NOT uploaded (it contains secrets). You must create it on the server.

**Option A — Hostinger File Manager (easiest):**
1. Go to Hostinger hPanel → Files → File Manager
2. Navigate to your `public_html/` folder
3. Create a new file named `.env`
4. Paste the production configuration (see template below)

**Option B — SSH:**
```bash
ssh username@yourserver.com
cd public_html   # or your FTP_SERVER_DIR
nano .env
```

**.env template for production:**
```ini
APP_NAME="Fischer Pakistan"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u271928709_fischer
DB_USERNAME=u271928709_fischer
DB_PASSWORD=YOUR_DB_PASSWORD_HERE

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_DOMAIN=.yourdomain.com
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=YOUR_MAIL_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Fischer Pakistan"
```

> **Get your APP_KEY:** If you have one from a previous deployment, reuse it. Otherwise generate one locally: `php artisan key:generate --show`

---

## Step 5 — Import the Database

Use the merged database file: **`fischer_merged.sql`** (in your project root).

1. Go to Hostinger hPanel → Databases → phpMyAdmin
2. Select your database (`u271928709_fischer`) from the left panel
3. Click **Import** tab
4. Click **Choose File** → select `fischer_merged.sql`
5. Click **Go** to import

> The merged database has 94 tables with all production data plus the new schema additions (UTM tracking on orders, 5 new tables for marketing/sales features).

---

## Step 6 — Run Composer & Laravel Setup (SSH)

After uploading files, SSH into Hostinger to install PHP dependencies and warm up caches.

**Hostinger SSH:**
- Host: same as FTP host
- Port: `65002` (Hostinger uses non-standard SSH port)
- Username/Password: same as FTP

```bash
# Navigate to your app root
cd public_html    # or your FTP_SERVER_DIR

# Install PHP dependencies (only if vendor/ is missing or composer.json changed)
composer install --no-dev --optimize-autoloader --no-interaction

# Clear all Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Warm up caches for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set storage permissions
chmod -R 775 storage bootstrap/cache
```

> **If no SSH access:** You can skip the cache warming. The app will work but be slightly slower on first requests. Run migrations via phpMyAdmin by importing `fischer_merged.sql` (it includes all the schema).

---

## Step 7 — Verify the Deployment

1. Open your domain in a browser
2. Check the homepage loads (React SPA)
3. Check that the shop loads products (`/shop`)
4. Check admin works (`/admin`)
5. Test adding to cart and checkout
6. Check API health: `https://yourdomain.com/up` → should return `{"status":"ok"}`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| White page / blank screen | Check `.env` exists on server with correct APP_KEY |
| API calls return 500 | SSH in and run `php artisan config:clear && php artisan config:cache` |
| Products/images not showing | Check `public/images/` was uploaded (large folder) |
| "Vendor autoload not found" error | Run `composer install` on server via SSH |
| Database errors | Verify DB_DATABASE, DB_USERNAME, DB_PASSWORD in `.env` match Hostinger DB settings |
| 403 on all routes | Check `.htaccess` was uploaded and mod_rewrite is enabled |

---

## Quick Re-Deploy (Code Changes Only)

For subsequent deployments after the initial setup:

```powershell
# 1. Rebuild frontend
cd frontend && npm run build && cd ..

# 2. Recreate deploy package (PowerShell)
Remove-Item -Recurse -Force deploy -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path deploy | Out-Null
Copy-Item -Recurse backend\* deploy\ -Force
Copy-Item -Recurse frontend\dist\* deploy\public\ -Force
Remove-Item -Recurse -Force deploy\vendor -ErrorAction SilentlyContinue
Remove-Item -Force deploy\.env deploy\.env.example deploy\.env.production -ErrorAction SilentlyContinue

# 3. FTP upload deploy/ to public_html/ (skip vendor/)
# 4. SSH: php artisan config:cache && php artisan route:cache
```
