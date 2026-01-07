# Fischer Pakistan E-Commerce Platform

A full-featured enterprise e-commerce platform for Fischer Pakistan home appliances, built with Laravel 11 backend and React 18 frontend.

## 🌐 Production URL

- **Website:** https://fischer.codeformulator.com
- **API:** https://fischer.codeformulator.com/api

## 🛠 Tech Stack

### Backend
- **PHP 8.2+** with **Laravel 11**
- **MySQL 8.0+** database
- **Laravel Sanctum** for API authentication
- **Spatie Permission** for roles & permissions
- **Intervention Image** for image processing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Router 6** for routing

## ✨ Features

### Customer Features
- Product browsing with advanced filters and search
- Shopping cart (guest & authenticated)
- Multiple payment options:
  - Cash on Delivery (COD)
  - JazzCash
  - EasyPaisa
  - Credit/Debit Cards
- User accounts with order history
- Wishlist functionality
- Product reviews and ratings
- Loyalty points program
- Service request system for appliance repairs

### Admin Dashboard
- Real-time analytics dashboard
- Product management with variants (size, color, etc.)
- Order management with status tracking
- Customer management
- Category & subcategory management
- CMS for static pages
- Coupon & discount management
- Banner & slider management
- Settings management

### Dealer/B2B Portal
- Dealer registration and approval workflow
- Special dealer pricing
- Bulk ordering capabilities
- Credit limit management
- Dealer-specific discounts

## 📁 Project Structure

```
fischer/
├── backend/                 # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/          # Customer API controllers
│   │   │   │   ├── Admin/        # Admin API controllers
│   │   │   │   └── Dealer/       # Dealer API controllers
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/              # Eloquent models
│   │   └── Services/            # Business logic services
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Database seeders
│   ├── routes/
│   │   └── api.php              # API routes
│   └── config/
├── frontend/                # React 18 SPA
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # UI primitives
│   │   │   └── layout/          # Layout components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── dealer/          # Dealer portal pages
│   │   │   └── ...              # Customer pages
│   │   ├── stores/              # Zustand stores
│   │   ├── lib/                 # Utilities & API client
│   │   └── types/               # TypeScript types
│   └── public/
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD workflow
├── DEPLOYMENT.md            # Detailed deployment guide
└── README.md
```

## 🚀 Local Development

### Prerequisites
- PHP 8.2+ with extensions: mbstring, pdo_mysql, xml, ctype, json, tokenizer, bcmath, gd, zip
- Composer 2.x
- Node.js 18+ (LTS recommended)
- MySQL 8.0+
- XAMPP/WAMP/MAMP (optional)

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env

# Edit .env with your database credentials:
# DB_DATABASE=fischer
# DB_USERNAME=root
# DB_PASSWORD=

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve
# API will be available at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App will be available at http://localhost:5173
```

## ⚙️ Environment Variables

### Backend (.env)

```env
APP_NAME="Fischer Pakistan"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fischer
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@fischerpk.com"
MAIL_FROM_NAME="${APP_NAME}"

# JazzCash Configuration
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_ENVIRONMENT=sandbox

# EasyPaisa Configuration
EASYPAISA_STORE_ID=
EASYPAISA_USERNAME=
EASYPAISA_PASSWORD=
EASYPAISA_ENVIRONMENT=sandbox
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Fischer Pakistan
```

## 🚢 Deployment

The project uses GitHub Actions for automated CI/CD deployment to Hostinger shared hosting.

### Automatic Deployment

1. Push code to `main` branch
2. GitHub Actions automatically:
   - Builds React frontend with Vite
   - Installs PHP dependencies
   - Deploys via FTP
   - Runs migrations via SSH
   - Clears and rebuilds caches

### Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `FTP_SERVER` | FTP server address | `151.106.97.167` |
| `FTP_USERNAME` | FTP username | `u271928709` |
| `FTP_PASSWORD` | FTP password | `your-password` |
| `FTP_SERVER_DIR` | Target directory | `public_html/fischer/` |
| `SSH_HOST` | SSH hostname | `151.106.97.167` |
| `SSH_USERNAME` | SSH username | `u271928709` |
| `SSH_PASSWORD` | SSH password | `your-password` |
| `SSH_PORT` | SSH port | `65002` |
| `SSH_SERVER_DIR` | Full server path | `/home/u271928709/public_html/fischer` |
| `VITE_API_URL` | Production API URL | `https://fischer.codeformulator.com/api` |

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed manual deployment instructions.

## 🎨 Brand Guidelines

- **Primary Color (Yellow):** `#f4b42c`
- **Dark Color:** `#313131`
- **Secondary Gray:** `#8e8e8e`
- **Font Family:** Poppins

## 📡 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/{slug}` | Product details |
| GET | `/api/categories` | List categories |
| GET | `/api/brands` | List brands |
| GET | `/api/banners` | Get active banners |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |

### Cart & Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/{id}` | Update cart item |
| DELETE | `/api/cart/{id}` | Remove from cart |
| POST | `/api/checkout` | Place order |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |

### User Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | User's orders |
| GET | `/api/orders/{id}` | Order details |
| GET | `/api/wishlist` | User's wishlist |
| POST | `/api/wishlist` | Add to wishlist |
| GET | `/api/addresses` | User's addresses |
| POST | `/api/reviews` | Submit product review |

### Admin Endpoints (Authenticated + Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| CRUD | `/api/admin/products` | Product management |
| CRUD | `/api/admin/categories` | Category management |
| CRUD | `/api/admin/orders` | Order management |
| CRUD | `/api/admin/users` | User management |
| CRUD | `/api/admin/coupons` | Coupon management |
| CRUD | `/api/admin/banners` | Banner management |
| GET | `/api/admin/reports/*` | Various reports |

### Dealer Endpoints (Authenticated + Dealer Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dealer/dashboard` | Dealer dashboard |
| GET | `/api/dealer/products` | Products with dealer pricing |
| POST | `/api/dealer/orders` | Place bulk order |
| GET | `/api/dealer/credit` | Credit information |

## 🗄 Database Schema

### Core Tables
- `users` - Customer accounts
- `products` - Product catalog
- `product_variants` - Product variations (size, color)
- `categories` - Product categories
- `brands` - Product brands
- `orders` - Customer orders
- `order_items` - Order line items
- `carts` - Shopping carts
- `cart_items` - Cart line items

### Additional Tables
- `dealers` - B2B dealer accounts
- `addresses` - User shipping/billing addresses
- `wishlists` - User wishlists
- `reviews` - Product reviews
- `coupons` - Discount coupons
- `banners` - Homepage banners
- `pages` - CMS pages
- `settings` - System settings
- `service_requests` - Appliance service requests
- `loyalty_points` - Customer loyalty program

## 🔒 Security Features

- CSRF protection
- XSS prevention
- SQL injection protection (Eloquent ORM)
- Rate limiting on API endpoints
- Sanctum token authentication
- Role-based access control
- Password hashing (bcrypt)
- HTTPS enforced in production

## 📝 License

Proprietary - Fischer Pakistan. All rights reserved.

## 👥 Support

For technical support or questions, contact the development team.
