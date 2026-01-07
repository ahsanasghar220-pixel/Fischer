# Fischer Pakistan E-Commerce

A full-featured e-commerce platform for Fischer Pakistan home appliances, built with Laravel backend and React frontend.

## Tech Stack

### Backend
- **PHP 8.2+** with **Laravel 11**
- **MySQL 8.0+** database
- **Laravel Sanctum** for authentication
- **Spatie Permission** for roles/permissions
- **Intervention Image** for image processing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **TanStack Query** for server state
- **Zustand** for client state
- **React Router 6** for routing

## Features

### Customer Features
- Product browsing with filters and search
- Shopping cart (guest & authenticated)
- Multiple payment options (COD, JazzCash, EasyPaisa, Cards)
- User accounts with order history
- Wishlist
- Product reviews and ratings
- Loyalty points program
- Service request system

### Admin Features
- Dashboard with analytics
- Product management with variants
- Order management
- Customer management
- Category management
- CMS for pages
- Settings management

### Dealer/B2B Features
- Dealer registration and approval
- Special pricing
- Bulk ordering
- Credit management

## Project Structure

```
fischer/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   ├── routes/
│   └── config/
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── lib/
│   └── public/
└── .github/workflows/     # CI/CD
```

## Local Development

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Environment Variables

### Backend (.env)
```env
APP_NAME="Fischer Pakistan"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fischer
DB_USERNAME=root
DB_PASSWORD=

# Payment gateways
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=

EASYPAISA_STORE_ID=
EASYPAISA_USERNAME=
EASYPAISA_PASSWORD=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Configure secrets in GitHub repository settings

## Brand Guidelines

- **Primary Color**: #f4b42c (Yellow)
- **Dark Colors**: #313131, #8e8e8e
- **Font**: Poppins

## API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/products/{slug}` - Product details
- `GET /api/categories` - List categories
- `POST /api/cart` - Cart operations

### Authenticated
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/orders` - User orders
- `POST /api/checkout` - Place order

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `CRUD /api/admin/products` - Product management
- `CRUD /api/admin/orders` - Order management

## License

Proprietary - Fischer Pakistan
