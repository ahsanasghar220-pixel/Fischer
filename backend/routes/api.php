<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\DealerController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BundleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

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

// Cart (works for both guests and authenticated users)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'add']);
    Route::put('/items/{itemId}', [CartController::class, 'update']);
    Route::delete('/items/{itemId}', [CartController::class, 'remove']);
    Route::delete('/clear', [CartController::class, 'clear']);
    Route::post('/coupon', [CartController::class, 'applyCoupon']);
    Route::delete('/coupon', [CartController::class, 'removeCoupon']);
});

// Shipping methods (GET for frontend compatibility)
Route::get('/shipping/methods', [CheckoutController::class, 'getShippingMethods']);

// Checkout
Route::prefix('checkout')->group(function () {
    Route::post('/shipping-methods', [CheckoutController::class, 'getShippingMethods']);
    Route::post('/calculate-totals', [CheckoutController::class, 'calculateTotals']);
    Route::post('/place-order', [CheckoutController::class, 'placeOrder']);
});

// Order tracking and viewing (public - for guest checkout)
Route::get('/orders/{orderNumber}/track', [OrderController::class, 'track']);
Route::get('/orders/{orderNumber}/view', [OrderController::class, 'publicShow']);

// Payment callbacks
Route::prefix('payments')->group(function () {
    Route::any('/jazzcash/callback', [PaymentController::class, 'jazzcashCallback']);
    Route::any('/easypaisa/callback', [PaymentController::class, 'easypaisaCallback']);
});

// Service requests (public submission)
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
Route::post('/cart/bundle', [BundleController::class, 'addToCart']);

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
        Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    });

    // Account
    Route::prefix('account')->group(function () {
        Route::get('/dashboard', [AccountController::class, 'dashboard']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::get('/loyalty-points', [AccountController::class, 'loyaltyPoints']);
        Route::get('/service-requests', [AccountController::class, 'serviceRequests']);
    });

    // Addresses
    Route::prefix('addresses')->group(function () {
        Route::get('/', [AddressController::class, 'index']);
        Route::post('/', [AddressController::class, 'store']);
        Route::put('/{address}', [AddressController::class, 'update']);
        Route::delete('/{address}', [AddressController::class, 'destroy']);
        Route::post('/{address}/default-shipping', [AddressController::class, 'setDefaultShipping']);
        Route::post('/{address}/default-billing', [AddressController::class, 'setDefaultBilling']);
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/{orderNumber}/cancel', [OrderController::class, 'cancel']);
        Route::post('/{orderNumber}/reorder', [OrderController::class, 'reorder']);
        Route::get('/{orderNumber}/invoice', [OrderController::class, 'downloadInvoice']);
    });

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/toggle', [WishlistController::class, 'toggle']);
        Route::post('/{productId}', [WishlistController::class, 'add']);
        Route::delete('/{productId}', [WishlistController::class, 'remove']);
        Route::post('/check', [WishlistController::class, 'check']);
        Route::post('/{wishlistId}/move-to-cart', [WishlistController::class, 'moveToCart']);
    });

    // Reviews
    Route::prefix('reviews')->group(function () {
        Route::get('/my-reviews', [ReviewController::class, 'userReviews']);
        Route::post('/', [ReviewController::class, 'store']);
        Route::put('/{reviewId}', [ReviewController::class, 'update']);
        Route::delete('/{reviewId}', [ReviewController::class, 'destroy']);
        Route::post('/{reviewId}/helpful', [ReviewController::class, 'markHelpful']);
        Route::get('/can-review/{productId}', [ReviewController::class, 'canReview']);
    });

    // Service requests (authenticated)
    Route::prefix('service-requests')->group(function () {
        Route::get('/', [ServiceRequestController::class, 'index']);
        Route::get('/{ticketNumber}', [ServiceRequestController::class, 'show']);
        Route::post('/{ticketNumber}/cancel', [ServiceRequestController::class, 'cancel']);
        Route::post('/{ticketNumber}/feedback', [ServiceRequestController::class, 'submitFeedback']);
    });

    // Dealer
    Route::prefix('dealer')->group(function () {
        Route::post('/register', [DealerController::class, 'register']);
        Route::get('/status', [DealerController::class, 'status']);

        // Dealer portal (requires approved dealer)
        Route::middleware('role:dealer')->group(function () {
            Route::get('/dashboard', [DealerController::class, 'dashboard']);
            Route::get('/products', [DealerController::class, 'products']);
            Route::post('/orders', [DealerController::class, 'placeOrder']);
            Route::get('/orders', [DealerController::class, 'orders']);
        });
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super-admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
    Route::get('/analytics', [App\Http\Controllers\Api\Admin\DashboardController::class, 'analytics']);

    // Products
    Route::apiResource('products', App\Http\Controllers\Api\Admin\ProductController::class);
    Route::post('/products/{product}/images', [App\Http\Controllers\Api\Admin\ProductController::class, 'uploadImages']);
    Route::delete('/products/{product}/images/{image}', [App\Http\Controllers\Api\Admin\ProductController::class, 'deleteImage']);
    Route::put('/products/{product}/images/{image}/primary', [App\Http\Controllers\Api\Admin\ProductController::class, 'setPrimaryImage']);
    Route::post('/products/import', [App\Http\Controllers\Api\Admin\ProductController::class, 'import']);
    Route::get('/products/export', [App\Http\Controllers\Api\Admin\ProductController::class, 'export']);

    // Categories
    Route::apiResource('categories', App\Http\Controllers\Api\Admin\CategoryController::class);

    // Brands
    Route::apiResource('brands', App\Http\Controllers\Api\Admin\BrandController::class);

    // Attributes
    Route::apiResource('attributes', App\Http\Controllers\Api\Admin\AttributeController::class);
    Route::apiResource('attributes.values', App\Http\Controllers\Api\Admin\AttributeValueController::class)->shallow();

    // Orders
    Route::apiResource('orders', App\Http\Controllers\Api\Admin\OrderController::class)->only(['index', 'show', 'update']);
    Route::post('/orders/{order}/status', [App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/tracking', [App\Http\Controllers\Api\Admin\OrderController::class, 'updateTracking']);

    // Customers
    Route::apiResource('customers', App\Http\Controllers\Api\Admin\CustomerController::class);
    Route::get('/customers/{customer}/orders', [App\Http\Controllers\Api\Admin\CustomerController::class, 'orders']);

    // Dealers
    Route::apiResource('dealers', App\Http\Controllers\Api\Admin\DealerController::class);
    Route::post('/dealers/{dealer}/approve', [App\Http\Controllers\Api\Admin\DealerController::class, 'approve']);
    Route::post('/dealers/{dealer}/reject', [App\Http\Controllers\Api\Admin\DealerController::class, 'reject']);

    // Coupons
    Route::apiResource('coupons', App\Http\Controllers\Api\Admin\CouponController::class);

    // Reviews
    Route::apiResource('reviews', App\Http\Controllers\Api\Admin\ReviewController::class)->only(['index', 'show', 'destroy']);
    Route::post('/reviews/{review}/approve', [App\Http\Controllers\Api\Admin\ReviewController::class, 'approve']);
    Route::post('/reviews/{review}/reject', [App\Http\Controllers\Api\Admin\ReviewController::class, 'reject']);

    // Service requests
    Route::apiResource('service-requests', App\Http\Controllers\Api\Admin\ServiceRequestController::class)->only(['index', 'show', 'update']);
    Route::post('/service-requests/{serviceRequest}/assign', [App\Http\Controllers\Api\Admin\ServiceRequestController::class, 'assign']);

    // CMS
    Route::apiResource('pages', App\Http\Controllers\Api\Admin\PageController::class);
    Route::apiResource('banners', App\Http\Controllers\Api\Admin\BannerController::class);
    Route::apiResource('faqs', App\Http\Controllers\Api\Admin\FaqController::class);
    Route::apiResource('faq-categories', App\Http\Controllers\Api\Admin\FaqCategoryController::class);
    Route::apiResource('testimonials', App\Http\Controllers\Api\Admin\TestimonialController::class);

    // Shipping
    Route::apiResource('shipping-zones', App\Http\Controllers\Api\Admin\ShippingZoneController::class);
    Route::apiResource('shipping-methods', App\Http\Controllers\Api\Admin\ShippingMethodController::class);

    // Settings
    Route::get('/settings', [App\Http\Controllers\Api\Admin\SettingController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\Api\Admin\SettingController::class, 'update']);
    Route::post('/settings', [App\Http\Controllers\Api\Admin\SettingController::class, 'update']);
    Route::get('/settings/{group}', [App\Http\Controllers\Api\Admin\SettingController::class, 'group']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/sales', [App\Http\Controllers\Api\Admin\ReportController::class, 'sales']);
        Route::get('/products', [App\Http\Controllers\Api\Admin\ReportController::class, 'products']);
        Route::get('/customers', [App\Http\Controllers\Api\Admin\ReportController::class, 'customers']);
        Route::get('/inventory', [App\Http\Controllers\Api\Admin\ReportController::class, 'inventory']);
    });

    // Contact messages
    Route::apiResource('contact-messages', App\Http\Controllers\Api\Admin\ContactMessageController::class)->only(['index', 'show', 'update', 'destroy']);

    // Newsletter
    Route::get('/newsletter-subscribers', [App\Http\Controllers\Api\Admin\NewsletterController::class, 'index']);
    Route::delete('/newsletter-subscribers/{subscriber}', [App\Http\Controllers\Api\Admin\NewsletterController::class, 'destroy']);
    Route::get('/newsletter-subscribers/export', [App\Http\Controllers\Api\Admin\NewsletterController::class, 'export']);

    // Bundles
    Route::prefix('bundles')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\BundleController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\Admin\BundleController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\Admin\BundleController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Api\Admin\BundleController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\BundleController::class, 'destroy']);
        Route::post('/{id}/duplicate', [App\Http\Controllers\Api\Admin\BundleController::class, 'duplicate']);
        Route::put('/{id}/toggle', [App\Http\Controllers\Api\Admin\BundleController::class, 'toggle']);
        Route::get('/{id}/analytics', [App\Http\Controllers\Api\Admin\BundleController::class, 'analytics']);
        // Slots (configurable bundles)
        Route::post('/{id}/slots', [App\Http\Controllers\Api\Admin\BundleController::class, 'addSlot']);
        Route::put('/{id}/slots/{slotId}', [App\Http\Controllers\Api\Admin\BundleController::class, 'updateSlot']);
        Route::delete('/{id}/slots/{slotId}', [App\Http\Controllers\Api\Admin\BundleController::class, 'removeSlot']);
        // Items (fixed bundles)
        Route::post('/{id}/items', [App\Http\Controllers\Api\Admin\BundleController::class, 'addItem']);
        Route::put('/{id}/items/{itemId}', [App\Http\Controllers\Api\Admin\BundleController::class, 'updateItem']);
        Route::delete('/{id}/items/{itemId}', [App\Http\Controllers\Api\Admin\BundleController::class, 'removeItem']);
        // Images
        Route::post('/{id}/images', [App\Http\Controllers\Api\Admin\BundleController::class, 'uploadImages']);
        Route::delete('/{id}/images/{imageId}', [App\Http\Controllers\Api\Admin\BundleController::class, 'deleteImage']);
        Route::put('/{id}/images/{imageId}/primary', [App\Http\Controllers\Api\Admin\BundleController::class, 'setPrimaryImage']);
        // Bulk actions
        Route::post('/bulk', [App\Http\Controllers\Api\Admin\BundleController::class, 'bulkAction']);
    });

    // Homepage Settings
    Route::prefix('homepage')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\HomepageController::class, 'index']);
        Route::put('/sections/{key}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateSection']);
        Route::post('/sections/reorder', [App\Http\Controllers\Api\Admin\HomepageController::class, 'reorderSections']);
        Route::put('/stats', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateStats']);
        Route::put('/features', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateFeatures']);
        Route::put('/trust-badges', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateTrustBadges']);
        Route::put('/categories', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateCategories']);
        Route::put('/products/{section}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateProducts']);

        // Testimonials
        Route::get('/testimonials', [App\Http\Controllers\Api\Admin\HomepageController::class, 'getTestimonials']);
        Route::post('/testimonials', [App\Http\Controllers\Api\Admin\HomepageController::class, 'storeTestimonial']);
        Route::put('/testimonials/{id}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateTestimonial']);
        Route::delete('/testimonials/{id}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'deleteTestimonial']);

        // Banners
        Route::get('/banners', [App\Http\Controllers\Api\Admin\HomepageController::class, 'getBanners']);
        Route::post('/banners', [App\Http\Controllers\Api\Admin\HomepageController::class, 'storeBanner']);
        Route::put('/banners/{id}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateBanner']);
        Route::delete('/banners/{id}', [App\Http\Controllers\Api\Admin\HomepageController::class, 'deleteBanner']);

        // Notable Clients
        Route::put('/notable-clients', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateNotableClients']);
        Route::post('/notable-clients/upload', [App\Http\Controllers\Api\Admin\HomepageController::class, 'uploadClientLogo']);
    });

    // Real-time Analytics
    Route::prefix('analytics/realtime')->group(function () {
        Route::get('/overview', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'overview']);
        Route::get('/activity-feed', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'activityFeed']);
        Route::get('/geographic', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'geographic']);
        Route::get('/traffic-sources', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'trafficSources']);
        Route::get('/conversion-funnel', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'conversionFunnel']);
        Route::get('/active-sessions', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'activeSessions']);
        Route::get('/cart-analytics', [App\Http\Controllers\Api\Admin\RealTimeAnalyticsController::class, 'cartAnalytics']);
    });
});
