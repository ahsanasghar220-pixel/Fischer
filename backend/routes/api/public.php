<?php

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\DealerController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\BundleController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (no authentication required)
|--------------------------------------------------------------------------
*/

// Public settings — used by frontend for dynamic theming
Route::get('/settings/brand-color', [AdminSettingController::class, 'brandColor']);

// Home page data
Route::get('/home', [HomeController::class, 'index']);

// Products
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/bestsellers', [ProductController::class, 'bestsellers']);
    Route::get('/recently-viewed', [ProductController::class, 'recentlyViewed']);
    Route::get('/category/{slug}', [ProductController::class, 'byCategory']);
    Route::get('/{slug}', [ProductController::class, 'show']);
    Route::get('/{slug}/reviews', [ProductController::class, 'reviews']);
});

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/featured', [CategoryController::class, 'featured']);
    Route::get('/tree', [CategoryController::class, 'tree']);
    Route::get('/with-count', [CategoryController::class, 'withProductCount']);
    Route::get('/{slug}', [CategoryController::class, 'show']);
});

// Brands (public)
Route::get('/brands', [App\Http\Controllers\Api\BrandController::class, 'index']);
Route::get('/brands/{slug}', [App\Http\Controllers\Api\BrandController::class, 'show']);

// Order tracking and viewing (public — for guest checkout)
Route::get('/orders/{orderNumber}/track', [App\Http\Controllers\Api\OrderController::class, 'track']);
Route::get('/orders/{orderNumber}/view', [App\Http\Controllers\Api\OrderController::class, 'publicShow']);

// Payment callbacks
Route::prefix('payments')->group(function () {
    Route::any('/jazzcash/callback', [App\Http\Controllers\Api\PaymentController::class, 'jazzcashCallback']);
    Route::any('/easypaisa/callback', [App\Http\Controllers\Api\PaymentController::class, 'easypaisaCallback']);
});

// Service requests (public submission and tracking)
Route::prefix('service-requests')->group(function () {
    Route::post('/', [ServiceRequestController::class, 'store']);
    Route::get('/{ticketNumber}/track', [ServiceRequestController::class, 'track']);
    Route::get('/products', [ServiceRequestController::class, 'getProducts']);
});

// Dealer public routes
Route::prefix('dealers')->group(function () {
    Route::get('/find', [DealerController::class, 'findDealers']);
    Route::get('/cities', [DealerController::class, 'cities']);
});

// Pages & Content
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/banners/{position}', [HomeController::class, 'banners']);
Route::get('/faqs', [PageController::class, 'faqs']);
Route::get('/testimonials', [HomeController::class, 'testimonials']);

// Portfolio
Route::get('/portfolio/videos', [App\Http\Controllers\Api\PortfolioController::class, 'index']);

// Contact
Route::post('/contact', [ContactController::class, 'submit']);
Route::post('/newsletter/subscribe', [ContactController::class, 'subscribeNewsletter']);

// Bundles
Route::prefix('bundles')->group(function () {
    Route::get('/', [BundleController::class, 'index']);
    Route::get('/homepage', [BundleController::class, 'homepage']);
    Route::get('/{slug}', [BundleController::class, 'show']);
    Route::post('/{slug}/calculate', [BundleController::class, 'calculate']);
    Route::get('/{slug}/related', [BundleController::class, 'related']);
});

// Sales (public)
Route::prefix('sales')->group(function () {
    Route::get('/', [SaleController::class, 'index']);
    Route::get('/{slug}', [SaleController::class, 'show']);
});
