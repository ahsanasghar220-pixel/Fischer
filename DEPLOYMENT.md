# Fischer E-Commerce Deployment Guide

## Production URL
- **Website:** https://fischer.codeformulator.com
- **API:** https://fischer.codeformulator.com/api

## Prerequisites

1. **Hostinger Shared Hosting** with:
   - PHP 8.2+
   - MySQL 8.0+
   - SSH Access (for post-deployment tasks)
   - FTP Access

2. **GitHub Repository** secrets configured:
   - `FTP_SERVER` - Hostinger FTP server address
   - `FTP_USERNAME` - FTP username
   - `FTP_PASSWORD` - FTP password
   - `FTP_SERVER_DIR` - Target directory on server (e.g., `public_html/`)
   - `SSH_HOST` - SSH hostname
   - `SSH_USERNAME` - SSH username
   - `SSH_PASSWORD` - SSH password
   - `SSH_PORT` - SSH port (usually 22)
   - `SSH_SERVER_DIR` - Full path to deployment directory
   - `VITE_API_URL` - `https://fischer.codeformulator.com/api`

## Initial Setup (First Deployment)

### 1. Database Setup

1. Log into Hostinger hPanel
2. Go to MySQL Databases
3. Create a new database (e.g., `fischer_ecommerce`)
4. Create a database user with full privileges
5. Note the database name, username, and password

### 2. Environment Configuration

Create `.env` file on the server (in the root directory):

```env
APP_NAME="Fischer Pakistan"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://fischer.codeformulator.com

LOG_CHANNEL=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u271928709_fischer
DB_USERNAME=u271928709_fischer
DB_PASSWORD=Fischerpk123*

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=your-email@fischerpk.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@fischer.codeformulator.com
MAIL_FROM_NAME="${APP_NAME}"

# JazzCash Configuration
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
JAZZCASH_ENVIRONMENT=production
JAZZCASH_RETURN_URL=https://fischer.codeformulator.com/payment/jazzcash/callback

# EasyPaisa Configuration
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_USERNAME=your_username
EASYPAISA_PASSWORD=your_password
EASYPAISA_ENVIRONMENT=production
```

### 3. Generate Application Key

After first deployment, SSH into server and run:
```bash
cd /path/to/your/site
php artisan key:generate
```

### 4. Run Initial Migrations and Seeders

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 5. Create Storage Link

```bash
php artisan storage:link
```

### 6. Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## Automated Deployment

Push to `main` branch triggers automatic deployment:

1. Builds React frontend with Vite
2. Installs PHP dependencies
3. Creates deployment package
4. Uploads via FTP
5. Runs post-deployment tasks via SSH

## Manual Deployment

If automated deployment fails:

### Backend
```bash
cd backend
composer install --no-dev --optimize-autoloader
# Upload all files except .env, node_modules, tests
```

### Frontend
```bash
cd frontend
npm ci
npm run build
# Upload dist/* to public/ folder on server
```

### Post Upload
SSH into server and run:
```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

## Troubleshooting

### 500 Internal Server Error
1. Check `.env` file exists and is configured
2. Check storage and cache permissions
3. Check PHP error logs in Hostinger hPanel

### Database Connection Errors
1. Verify database credentials in `.env`
2. Ensure database exists
3. Check MySQL user privileges

### Storage/Upload Issues
1. Ensure `storage/app/public` exists
2. Run `php artisan storage:link`
3. Check directory permissions

### Cache Issues
Clear all caches:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Rollback

To rollback a deployment:
1. SSH into server
2. Restore previous files from backup (Hostinger keeps automatic backups)
3. If database changed: `php artisan migrate:rollback`

## Performance Optimization

### Enable OPcache
In `.htaccess` or php.ini:
```
php_flag opcache.enable On
```

### Enable Compression
Already configured in `.htaccess`

### Use CDN for Assets
Consider using Cloudflare for static assets

## Monitoring

1. Check Laravel logs: `storage/logs/laravel.log`
2. Monitor via Hostinger hPanel
3. Set up uptime monitoring (e.g., UptimeRobot)

## Security Checklist

- [ ] APP_DEBUG=false in production
- [ ] Strong database passwords
- [ ] HTTPS enabled
- [ ] Sensitive files protected via .htaccess
- [ ] Regular backups enabled
- [ ] Rate limiting configured
