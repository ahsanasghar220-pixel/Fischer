# Azure Deployment Setup Guide

This guide will help you set up automatic deployment from GitHub to Azure App Service.

## Prerequisites

- Active Azure subscription
- GitHub repository (already set up: `ahsanasghar220-pixel/Fischer`)
- Repository admin access to configure secrets

## Step 1: Create Azure App Service

### Option A: Using Azure Portal (Recommended for beginners)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create a Resource** → Search for "App Service"
3. **Fill in the details**:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing (e.g., `fischer-pakistan-rg`)
   - **Name**: `fischer-pakistan` (or your preferred name - this becomes your URL)
   - **Publish**: `Code`
   - **Runtime stack**: `PHP 8.2`
   - **Operating System**: `Linux` (recommended) or `Windows`
   - **Region**: Choose closest to your users (e.g., `East Asia`, `Southeast Asia`, or `Central India`)
   - **Pricing Plan**: Choose based on your needs:
     - `Free F1` - For testing
     - `Basic B1` - For small production (~$13/month)
     - `Standard S1` - For production with better performance (~$70/month)

4. **Configure Database** (if not already done):
   - In the same Resource Group, create **Azure Database for MySQL**
   - Or use your existing external MySQL database
   - Note the connection details for later

5. **Review + Create** → Wait for deployment to complete

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create Resource Group
az group create --name fischer-pakistan-rg --location eastasia

# Create App Service Plan
az appservice plan create \
  --name fischer-app-plan \
  --resource-group fischer-pakistan-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name fischer-pakistan \
  --resource-group fischer-pakistan-rg \
  --plan fischer-app-plan \
  --runtime "PHP|8.2"
```

## Step 2: Configure Azure App Service Settings

1. **Go to your App Service** in Azure Portal
2. **Configuration** → **Application settings**
3. **Add these environment variables**:

```env
# Laravel App Settings
APP_NAME=Fischer
APP_ENV=production
APP_DEBUG=false
APP_URL=https://fischer-pakistan.azurewebsites.net

# Database (use your Azure MySQL or external DB)
DB_CONNECTION=mysql
DB_HOST=your-mysql-server.mysql.database.azure.com
DB_PORT=3306
DB_DATABASE=fischer_db
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Laravel Keys
APP_KEY=base64:your-generated-key-here
JWT_SECRET=your-jwt-secret-here

# Mail Settings (if using email features)
MAIL_MAILER=smtp
MAIL_HOST=your-mail-host
MAIL_PORT=587
MAIL_USERNAME=your-mail-username
MAIL_PASSWORD=your-mail-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@fischer.com
MAIL_FROM_NAME=Fischer

# Storage
FILESYSTEM_DISK=public

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

4. **Save** the configuration

## Step 3: Get Azure Publish Profile

1. **In Azure Portal**, go to your App Service
2. **Overview** page → Click **Get publish profile** (top menu)
3. This downloads a `.PublishSettings` XML file
4. **Open the file** and copy its entire contents

## Step 4: Configure GitHub Secrets

1. **Go to your GitHub repository**: https://github.com/ahsanasghar220-pixel/Fischer
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"** and add these:

### Required Secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | *Paste entire XML content from publish profile* | Azure deployment credentials |
| `VITE_API_URL` | `https://fischer-pakistan.azurewebsites.net/api` | Frontend API endpoint |

### Optional Secrets (if you want to keep them private):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DB_HOST` | Your database host | `fischer-db.mysql.database.azure.com` |
| `DB_DATABASE` | Database name | `fischer_db` |
| `DB_USERNAME` | Database user | `fischer_admin` |
| `DB_PASSWORD` | Database password | `your-secure-password` |

**Note**: If you add DB secrets to GitHub, you'll need to modify the workflow to use them.

## Step 5: Update Workflow Configuration

Edit `.github/workflows/azure-deploy.yml`:

1. **Update `AZURE_WEBAPP_NAME`** to match your App Service name:
```yaml
env:
  AZURE_WEBAPP_NAME: fischer-pakistan  # Change this to your actual app name
```

2. **Verify `VITE_API_URL` secret** is set correctly in GitHub Secrets

## Step 6: Deploy!

### Automatic Deployment (Recommended)

Once you push to the `main` branch, GitHub Actions will automatically:
1. Build the React frontend
2. Install Laravel backend dependencies
3. Package everything
4. Deploy to Azure
5. Your site will be live at: `https://fischer-pakistan.azurewebsites.net`

### Manual Deployment

You can also trigger deployment manually:
1. Go to **GitHub** → **Actions** tab
2. Select **Deploy to Azure App Service**
3. Click **Run workflow** → **Run workflow**

## Step 7: Post-Deployment Setup (First Time Only)

After the first deployment, you need to run Laravel setup commands:

### Option A: Using Azure Portal SSH/Kudu

1. **Azure Portal** → Your App Service → **SSH** or **Advanced Tools (Kudu)**
2. **Run these commands** in the SSH terminal:

```bash
cd /home/site/wwwroot

# Generate app key (if not set in environment variables)
php artisan key:generate --force

# Create storage symlink
php artisan storage:link

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --class=CategorySeeder --force
php artisan db:seed --class=ProductSeeder --force
php artisan db:seed --class=BannerSeeder --force

# Cache config for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### Option B: Using Azure CLI (Advanced)

```bash
# Run commands via Azure CLI
az webapp ssh --name fischer-pakistan --resource-group fischer-pakistan-rg

# Then run the same commands as above
```

## Step 8: Verify Deployment

1. **Visit your site**: `https://fischer-pakistan.azurewebsites.net`
2. **Check API**: `https://fischer-pakistan.azurewebsites.net/api/health` (if you have a health endpoint)
3. **Check logs** in Azure Portal → **Log stream**

## Troubleshooting

### Deployment fails

- Check **GitHub Actions** logs for errors
- Verify all secrets are set correctly
- Check Azure App Service **Log stream** for runtime errors

### 500 Internal Server Error

- Check `.env` configuration in Azure
- Verify `APP_KEY` is set
- Check file permissions: `chmod -R 755 storage bootstrap/cache`
- Review logs in Azure Portal

### Database connection errors

- Verify database credentials in Azure Configuration
- Check if database server allows connections from Azure IPs
- For Azure MySQL, enable **Allow access to Azure services**

### Static assets not loading (CSS, JS, images)

- Check if `APP_URL` is set correctly in Azure Configuration
- Verify frontend build was successful in GitHub Actions logs
- Check if `storage/app/public` is linked: `php artisan storage:link`

### Images/Files returning 404

- Ensure files are in `storage/app/public` or `public/images`
- Run `php artisan storage:link` in Azure SSH
- Check file permissions: `chmod -R 755 storage`

## Custom Domain Setup (Optional)

To use your own domain (e.g., `www.fischer.pk`):

1. **Azure Portal** → Your App Service → **Custom domains**
2. **Add custom domain** → Follow the wizard
3. **Configure DNS** at your domain registrar:
   - Add `CNAME` record: `www` → `fischer-pakistan.azurewebsites.net`
   - Or `A` record pointing to Azure IP
4. **Add SSL certificate**:
   - Azure Portal → **TLS/SSL settings**
   - Use **Free Managed Certificate** (recommended)
   - Or upload your own certificate

## Monitoring & Maintenance

### Application Insights (Recommended)

1. Enable **Application Insights** in Azure Portal
2. Monitor performance, errors, and usage
3. Set up alerts for critical issues

### Automatic Backups

1. Azure Portal → **Backups**
2. Configure automatic backups for database and files
3. Set retention period

### Scaling

If your site grows:
1. **Scale Up**: Azure Portal → **Scale up** → Choose higher tier
2. **Scale Out**: Azure Portal → **Scale out** → Add more instances

## Cost Optimization

- Use **Basic B1** tier for production start (~$13/month)
- Enable **Auto-shutdown** for dev/staging environments
- Use **Azure MySQL Flexible Server** with Burstable tier for database
- Monitor costs in Azure Cost Management

## Next Steps

1. ✅ Create Azure App Service
2. ✅ Configure Application Settings
3. ✅ Get Publish Profile
4. ✅ Add GitHub Secrets
5. ✅ Push to GitHub (triggers deployment)
6. ✅ Run post-deployment commands via SSH
7. ✅ Test your site
8. 🔄 Configure custom domain (optional)
9. 🔄 Set up monitoring and alerts

---

**Need Help?**

- Azure Documentation: https://docs.microsoft.com/azure/app-service/
- Laravel on Azure: https://learn.microsoft.com/azure/app-service/quickstart-php
- GitHub Issues: https://github.com/ahsanasghar220-pixel/Fischer/issues

**Support:**
- Azure Support: https://azure.microsoft.com/support/
- Laravel Community: https://laravel.com/discord
