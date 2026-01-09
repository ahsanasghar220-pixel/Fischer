# Fischer Pakistan E-Commerce Platform

A full-featured, enterprise-grade e-commerce platform built for Fischer Pakistan home appliances. This modern, scalable solution features a Laravel 11 backend API and React 18 frontend single-page application.

## Production URL

- **Website:** https://fischer.codeformulator.com
- **API:** https://fischer.codeformulator.com/api

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features Overview](#features-overview)
- [Customer Features](#customer-features)
- [Admin Dashboard](#admin-dashboard)
- [Dealer/B2B Portal](#dealerb2b-portal)
- [Service Request System](#service-request-system)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Security Features](#security-features)

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 11.x | PHP Framework |
| PHP | 8.2+ | Server-side language |
| MySQL | 8.0+ | Database |
| Laravel Sanctum | - | API Token Authentication |
| Spatie Permission | - | Role-based Access Control |
| Intervention Image | 3.0 | Image Processing |
| Maatwebsite Excel | - | CSV Import/Export |
| Laravel DOMPDF | - | PDF Invoice Generation |
| Laravel Sluggable | - | URL-friendly Slugs |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Zustand | - | Client State Management |
| TanStack Query | - | Server State Management |
| React Router | 6.x | Routing |
| Axios | - | HTTP Client |
| Framer Motion | - | Animations |
| Headless UI | - | Accessible UI Components |
| Heroicons | - | Icons |
| Swiper | - | Product Sliders |
| React Hot Toast | - | Notifications |

---

## Features Overview

### Core E-Commerce Features
- Full product catalog with categories, brands, and variants
- Advanced search with filters (price, category, brand, availability)
- Shopping cart for both guest and authenticated users
- Multi-step checkout process
- Multiple payment methods (COD, JazzCash, EasyPaisa, Cards, Bank Transfer)
- Order tracking and management
- Wishlist functionality
- Product reviews and ratings with moderation

### Special Features
- B2B Dealer portal with special pricing and credit system
- Appliance service request and tracking system
- Loyalty points program with referral bonuses
- Newsletter subscription
- CMS for pages, banners, FAQs, and testimonials
- Dark mode support

---

## Customer Features

### Product Browsing

| Feature | Description |
|---------|-------------|
| Category Navigation | Hierarchical categories with featured flags |
| Brand Filtering | Browse products by brand |
| Search | Full-text search on product name, SKU, model number |
| Advanced Filters | Price range, category, brand, availability |
| Product Views | Grid/list view with sorting options |
| Product Details | Multiple images, specifications, variants, reviews |

### Shopping Cart

- **Guest Cart:** Session-based cart without login (uses session ID)
- **Persistent Cart:** Saved cart for logged-in users
- **Cart Operations:** Add, update quantity, remove items
- **Coupon Application:** Apply discount codes with validation
- **Cart Merge:** Guest cart merges with user cart on login

### Checkout Process

1. **Cart Review** - Review items, quantities, and totals
2. **Shipping Address** - Select saved address or enter new one
3. **Shipping Method** - Choose from available shipping options
4. **Billing Address** - Same as shipping or enter different address
5. **Payment Method** - Select payment option
6. **Order Review** - Final review and order placement

### Payment Methods

| Method | Type | Description |
|--------|------|-------------|
| Cash on Delivery | COD | Pay when order is delivered |
| JazzCash | Mobile Payment | Pakistan's leading mobile wallet |
| EasyPaisa | Mobile Payment | Popular Pakistan mobile payment |
| Credit/Debit Card | Online | Via integrated payment gateway |
| Bank Transfer | Manual | Transfer with receipt verification |

### Order Management

| Feature | Description |
|---------|-------------|
| Order Tracking | Real-time status updates with timeline |
| Order History | View all past orders with details |
| Order Details | Complete breakdown with items and pricing |
| Invoice Download | PDF invoice generation |
| Order Cancellation | Cancel eligible orders |
| Reorder | Quick reorder from previous orders |

**Order Status Flow:**
```
Pending -> Confirmed -> Processing -> Shipped -> Delivered
                                            \-> Cancelled
```

### User Account

| Section | Features |
|---------|----------|
| Profile | Update name, email, phone, avatar |
| Addresses | Manage multiple shipping/billing addresses |
| Orders | View order history and track orders |
| Wishlist | Save products for later purchase |
| Reviews | Write and manage product reviews |
| Password | Change password securely |

### Product Reviews

- Star ratings (1-5 scale)
- Written reviews with title and content
- Pros and cons lists
- Image attachments
- Verified purchase badge for buyers
- Helpful vote system
- Admin approval workflow

### Loyalty Program

| Feature | Description |
|---------|-------------|
| Points Earning | Earn points on every purchase |
| Points Redemption | Use points for discounts |
| Referral Bonus | Earn points when friends sign up |
| Transaction History | Track all point activities |

### Coupons & Discounts

Supported coupon types and rules:

| Rule | Options |
|------|---------|
| Discount Type | Percentage, Fixed Amount, Free Shipping |
| Date Range | Start and expiration dates |
| Usage Limits | Total uses and per-user limits |
| Minimum Order | Minimum cart value required |
| Maximum Discount | Cap on discount amount |
| Restrictions | First order only, specific categories/products |

---

## Admin Dashboard

Access the admin panel at `/admin` with admin credentials.

### Dashboard Overview

Real-time metrics displayed on the main dashboard:

**Order Metrics:**
- Orders placed today
- Orders this month
- Pending orders count
- Processing orders count

**Revenue Metrics:**
- Today's revenue
- This month's revenue
- Last month's revenue (comparison)

**Customer Metrics:**
- Total registered customers
- New customers this month

**Product Metrics:**
- Total products in catalog
- Active products
- Low stock products (alerts)
- Out of stock products

### Analytics Module

Customizable date ranges (7 days, 30 days, 90 days, 12 months):

- Sales trend charts
- Orders by status distribution
- Revenue by payment method
- Top-selling categories
- Sales by city/region
- Average order value
- Conversion funnel metrics

### Product Management

| Feature | Description |
|---------|-------------|
| CRUD Operations | Create, read, update, delete products |
| Image Management | Multiple images with primary selection |
| Variants | SKU, price, and stock per variant |
| Attributes | Flexible attribute system (size, color, etc.) |
| Specifications | Product specs and features list |
| Inventory | Stock tracking with low stock alerts |
| Bulk Import/Export | CSV import and export |
| Status Flags | Featured, new arrival, bestseller |
| SEO | Meta title, description, keywords |

### Order Management

| Feature | Description |
|---------|-------------|
| Order List | View all orders with filters |
| Order Details | Complete order information |
| Status Updates | Change order status with history |
| Tracking Info | Add courier and tracking number |
| Payment Status | Verify and update payment status |
| Admin Notes | Internal notes on orders |
| Invoice | Generate and download invoice |

### Customer Management

- View all customer profiles
- Customer order history
- Address management
- Loyalty points adjustment
- Account status control (active/suspended)

### Category Management

- Hierarchical categories (parent-child)
- Category images and icons
- Featured category flag
- Sort order configuration
- Product count per category

### Coupon Management

Create and manage discount codes:

| Setting | Options |
|---------|---------|
| Code | Unique coupon code |
| Type | Percentage / Fixed / Free Shipping |
| Value | Discount amount or percentage |
| Minimum Order | Required minimum cart value |
| Maximum Discount | Cap for percentage discounts |
| Usage Limit | Total and per-user limits |
| Date Range | Active period |
| Restrictions | Categories, products, first order only |

### Review Moderation

- View pending reviews
- Approve or reject reviews
- Respond to customer reviews
- Manage reported reviews

### Service Request Management

- View all service tickets
- Assign to technicians
- Update status and priority
- Schedule appointments
- Track costs and billing
- View customer feedback

### CMS Management

| Section | Features |
|---------|----------|
| Pages | Create/edit static pages (About, Policies, etc.) |
| Banners | Homepage sliders and promotional banners |
| FAQs | Frequently asked questions with categories |
| Testimonials | Customer testimonials for homepage |

### Shipping Configuration

- Define shipping zones (countries/regions)
- Configure shipping methods per zone
- Set flat rates or calculated shipping
- Free shipping thresholds

### Reports

| Report | Data Included |
|--------|---------------|
| Sales Report | Revenue by date, category, product |
| Customer Report | New customers, top customers |
| Product Report | Top sellers, view counts |
| Inventory Report | Stock levels, reorder alerts |

### Settings

- General settings (store name, contact info)
- Payment gateway configuration
- Email settings (SMTP)
- Tax configuration
- Shipping defaults

---

## Dealer/B2B Portal

### Dealer Registration

Businesses can apply to become dealers by providing:

- Business name and contact details
- Contact person information
- Business type (store, distributor, e-commerce, etc.)
- Tax numbers (NTN, STRN)
- Current brands carried
- Business documents

### Dealer Approval Workflow

```
Application Submitted -> Admin Review -> Approved/Rejected
                                              |
                                    Dealer Portal Access
```

### Dealer Features (After Approval)

| Feature | Description |
|---------|-------------|
| Dashboard | Business metrics and order summary |
| Special Pricing | Dealer-specific product prices |
| Bulk Ordering | Place large quantity orders |
| Order History | Track all dealer orders |
| Credit System | Credit limit and usage tracking |

### Admin Dealer Management

- Review dealer applications
- Approve or reject with notes
- Set credit limits per dealer
- Configure discount percentages
- Suspend or reactivate accounts

---

## Service Request System

Customers can request appliance service/repairs:

### Service Types
- Installation
- Repair
- Maintenance
- Warranty Claim
- Replacement

### Service Request Workflow

```
Customer Submission -> Admin Review -> Technician Assignment -> In Progress -> Completed
         |                                                                          |
    Ticket Generated                                                     Customer Feedback
    (SRV-YYYYMMDD-XXXX)
```

### Service Request Features

| Feature | Description |
|---------|-------------|
| Product Selection | Select product needing service |
| Issue Description | Describe the problem |
| Image Upload | Attach photos of the issue |
| Scheduling | Select preferred date/time |
| Tracking | Track request status |
| Priority Levels | Low, Medium, High, Urgent |
| Warranty Check | Warranty status verification |
| Cost Estimation | Service cost estimate |
| Feedback | Rate service after completion |

---

## Installation

### Prerequisites

- PHP 8.2+ with extensions: mbstring, pdo_mysql, xml, ctype, json, tokenizer, bcmath, gd, zip
- Composer 2.x
- Node.js 18+ (LTS recommended)
- MySQL 8.0+
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/fischer.git
cd fischer/backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_DATABASE=fischer
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed the database (optional - adds sample data)
php artisan db:seed

# Create admin user
php artisan admin:create --email=admin@fischer.pk --password=your_password

# Create storage link for uploaded files
php artisan storage:link

# Start development server
php artisan serve
# API available at http://localhost:8000
```

### Frontend Setup

```bash
cd fischer/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure API URL in .env
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
# App available at http://localhost:5173

# Build for production
npm run build
```

---

## Configuration

### Backend Environment Variables

```env
# Application
APP_NAME="Fischer Pakistan"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fischer
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@fischerpk.com"
MAIL_FROM_NAME="${APP_NAME}"

# JazzCash Payment Gateway
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_ENVIRONMENT=sandbox

# EasyPaisa Payment Gateway
EASYPAISA_STORE_ID=
EASYPAISA_USERNAME=
EASYPAISA_PASSWORD=
EASYPAISA_ENVIRONMENT=sandbox
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Fischer Pakistan"
```

---

## Project Structure

```
fischer/
├── backend/                    # Laravel 11 Backend API
│   ├── app/
│   │   ├── Console/           # Artisan commands
│   │   │   └── Commands/
│   │   │       └── CreateAdminUser.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/       # API Controllers
│   │   │   │       ├── Admin/ # Admin controllers (15+)
│   │   │   │       │   ├── DashboardController.php
│   │   │   │       │   ├── ProductController.php
│   │   │   │       │   ├── CategoryController.php
│   │   │   │       │   ├── OrderController.php
│   │   │   │       │   ├── CustomerController.php
│   │   │   │       │   └── ...
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── ProductController.php
│   │   │   │       ├── CartController.php
│   │   │   │       ├── CheckoutController.php
│   │   │   │       ├── OrderController.php
│   │   │   │       └── ...
│   │   │   └── Middleware/
│   │   ├── Models/            # Eloquent Models (31 models)
│   │   │   ├── User.php
│   │   │   ├── Product.php
│   │   │   ├── Category.php
│   │   │   ├── Order.php
│   │   │   ├── Cart.php
│   │   │   └── ...
│   │   └── Services/          # Business Logic
│   ├── database/
│   │   ├── migrations/        # Database schema
│   │   └── seeders/           # Sample data
│   ├── routes/
│   │   └── api.php            # All API routes (100+ endpoints)
│   └── config/                # Configuration files
│
├── frontend/                   # React 18 Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Header, Footer, Layout
│   │   │   ├── products/      # ProductCard, etc.
│   │   │   ├── ui/            # Button, Input, LoadingSpinner
│   │   │   └── utils/         # ScrollToTop, etc.
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── account/       # User account pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Wishlist.tsx
│   │   │   │   ├── Addresses.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── admin/         # Admin dashboard pages
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Products.tsx
│   │   │       ├── ProductEdit.tsx
│   │   │       ├── Orders.tsx
│   │   │       └── ...
│   │   ├── stores/            # Zustand State Management
│   │   │   ├── authStore.ts   # Authentication state
│   │   │   └── cartStore.ts   # Shopping cart state
│   │   ├── lib/
│   │   │   ├── api.ts         # Axios HTTP client
│   │   │   └── utils.ts       # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Main routing component
│   └── public/                # Static assets
│       └── images/
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD workflow
│
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/user` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/new-arrivals` | New arrival products |
| GET | `/api/products/bestsellers` | Best-selling products |
| GET | `/api/products/category/{slug}` | Products by category |
| GET | `/api/products/{slug}` | Product details |
| GET | `/api/products/{slug}/reviews` | Product reviews |

### Category & Brand Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/featured` | Featured categories |
| GET | `/api/categories/tree` | Category tree structure |
| GET | `/api/categories/{slug}` | Category details |
| GET | `/api/brands` | List all brands |
| GET | `/api/brands/{slug}` | Brand details |

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update item quantity |
| DELETE | `/api/cart/items/{id}` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |
| POST | `/api/cart/coupon` | Apply coupon code |
| DELETE | `/api/cart/coupon` | Remove applied coupon |

### Checkout Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout/shipping-methods` | Get available shipping methods |
| POST | `/api/checkout/calculate-totals` | Calculate order totals |
| POST | `/api/checkout/place-order` | Place the order |

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | User's order history | Yes |
| GET | `/api/orders/{orderNumber}` | Order details | Yes |
| POST | `/api/orders/{orderNumber}/cancel` | Cancel order | Yes |
| POST | `/api/orders/{orderNumber}/reorder` | Reorder | Yes |
| GET | `/api/orders/{orderNumber}/invoice` | Download invoice | Yes |
| GET | `/api/orders/{orderNumber}/track` | Track order | No |

### User Account Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | List user addresses |
| POST | `/api/addresses` | Add new address |
| PUT | `/api/addresses/{id}` | Update address |
| DELETE | `/api/addresses/{id}` | Delete address |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist/toggle` | Toggle product in wishlist |
| GET | `/api/reviews/my-reviews` | User's reviews |
| POST | `/api/reviews` | Submit product review |

### Admin Endpoints

All admin endpoints require authentication and admin role (`/api/admin/*`):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/analytics` | Analytics data |
| CRUD | `/api/admin/products` | Product management |
| POST | `/api/admin/products/{id}/images` | Upload product images |
| CRUD | `/api/admin/categories` | Category management |
| CRUD | `/api/admin/brands` | Brand management |
| CRUD | `/api/admin/orders` | Order management |
| POST | `/api/admin/orders/{id}/status` | Update order status |
| CRUD | `/api/admin/customers` | Customer management |
| CRUD | `/api/admin/coupons` | Coupon management |
| CRUD | `/api/admin/dealers` | Dealer management |
| POST | `/api/admin/dealers/{id}/approve` | Approve dealer |
| CRUD | `/api/admin/reviews` | Review moderation |
| CRUD | `/api/admin/service-requests` | Service requests |
| CRUD | `/api/admin/pages` | CMS pages |
| CRUD | `/api/admin/banners` | Banner management |
| CRUD | `/api/admin/faqs` | FAQ management |
| CRUD | `/api/admin/testimonials` | Testimonials |
| CRUD | `/api/admin/shipping-zones` | Shipping zones |
| GET | `/api/admin/settings` | Get settings |
| POST | `/api/admin/settings` | Update settings |
| GET | `/api/admin/reports/*` | Various reports |

### Dealer Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/dealer/register` | Apply as dealer | Yes |
| GET | `/api/dealer/status` | Check application status | Yes |
| GET | `/api/dealer/dashboard` | Dealer dashboard | Dealer |
| GET | `/api/dealer/products` | Products with dealer pricing | Dealer |
| POST | `/api/dealer/orders` | Place dealer order | Dealer |
| GET | `/api/dealer/orders` | Dealer order history | Dealer |

### Service Request Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/service-requests` | Submit service request | No |
| GET | `/api/service-requests/{ticket}/track` | Track request | No |
| GET | `/api/service-requests` | User's service requests | Yes |
| POST | `/api/service-requests/{ticket}/cancel` | Cancel request | Yes |
| POST | `/api/service-requests/{ticket}/feedback` | Submit feedback | Yes |

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Customer, admin, and dealer accounts |
| `products` | Product catalog with all details |
| `product_images` | Product image gallery |
| `product_variants` | Product variations (size, color, etc.) |
| `product_attributes` | Flexible product attributes |
| `categories` | Hierarchical product categories |
| `brands` | Product brands |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `carts` | Shopping carts |
| `cart_items` | Cart line items |

### User-Related Tables

| Table | Description |
|-------|-------------|
| `addresses` | User shipping/billing addresses |
| `wishlists` | User saved products |
| `reviews` | Product reviews |
| `loyalty_points` | Loyalty program transactions |

### Business Tables

| Table | Description |
|-------|-------------|
| `dealers` | B2B dealer applications and accounts |
| `coupons` | Discount coupon codes |
| `service_requests` | Appliance service requests |

### CMS Tables

| Table | Description |
|-------|-------------|
| `pages` | Static CMS pages |
| `banners` | Homepage banners/sliders |
| `faqs` | Frequently asked questions |
| `faq_categories` | FAQ categories |
| `testimonials` | Customer testimonials |

### System Tables

| Table | Description |
|-------|-------------|
| `settings` | System configuration |
| `shipping_zones` | Shipping zone definitions |
| `shipping_methods` | Shipping method options |
| `roles` | User roles (Spatie) |
| `permissions` | User permissions (Spatie) |
| `personal_access_tokens` | Sanctum API tokens |

---

## Deployment

### GitHub Actions CI/CD

The project includes automated deployment via GitHub Actions:

1. **Build:** React app built with Vite
2. **Dependencies:** PHP dependencies installed via Composer
3. **Deploy:** FTP deployment to hosting
4. **Migrate:** Database migrations via SSH
5. **Cache:** Clear and rebuild caches

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `FTP_SERVER` | FTP server address |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_SERVER_DIR` | Target directory on server |
| `SSH_HOST` | SSH hostname |
| `SSH_USERNAME` | SSH username |
| `SSH_PASSWORD` | SSH password |
| `SSH_PORT` | SSH port (usually 22 or custom) |
| `SSH_SERVER_DIR` | Full server path |
| `VITE_API_URL` | Production API URL |

### Manual Deployment

```bash
# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to web server
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| API Authentication | Laravel Sanctum token-based auth |
| Authorization | Spatie Permission (RBAC) |
| CSRF Protection | Built-in Laravel CSRF tokens |
| XSS Prevention | Input sanitization, output escaping |
| SQL Injection | Eloquent ORM with parameterized queries |
| Password Security | bcrypt hashing |
| HTTPS | Enforced in production |
| Rate Limiting | API endpoint rate limiting |

---

## User Roles

| Role | Permissions |
|------|-------------|
| Customer | Browse, purchase, reviews, account management |
| Dealer | Customer permissions + dealer portal, special pricing |
| Admin | Full admin dashboard access |
| Super Admin | All permissions including system settings |

---

## Brand Guidelines

| Element | Value |
|---------|-------|
| Primary Color (Yellow) | `#f4b42c` |
| Dark Color | `#313131` |
| Secondary Gray | `#8e8e8e` |
| Font Family | Poppins |

---

## Summary Statistics

- **Frontend Pages:** 30+ pages (public, auth, account, admin)
- **API Controllers:** 21 public + 15+ admin controllers
- **Database Models:** 31 Eloquent models
- **API Endpoints:** 100+ RESTful endpoints
- **Admin Modules:** 15+ management sections
- **Payment Methods:** 5 payment options
- **User Roles:** 4 distinct roles

---

## Support

For issues and feature requests, please open an issue on GitHub or contact the development team.

---

## License

Proprietary - Fischer Pakistan. All rights reserved.

---

Built by the Fischer Pakistan Development Team
