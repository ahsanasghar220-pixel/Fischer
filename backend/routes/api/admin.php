<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes (requires auth:sanctum + admin role)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin|super-admin|order-manager|content-manager'])->group(function () {
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

        // Hero Products
        Route::post('/hero-products/upload-image', [App\Http\Controllers\Api\Admin\HomepageController::class, 'uploadHeroImage']);

        // Notable Clients
        Route::put('/notable-clients', [App\Http\Controllers\Api\Admin\HomepageController::class, 'updateNotableClients']);
        Route::post('/notable-clients/upload', [App\Http\Controllers\Api\Admin\HomepageController::class, 'uploadClientLogo']);

        // Video upload
        Route::post('/upload-video', [App\Http\Controllers\Api\Admin\HomepageController::class, 'uploadVideo']);
    });

    // Portfolio Videos
    Route::prefix('portfolio-videos')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'destroy']);
        Route::post('/upload-video', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'uploadVideo']);
        Route::post('/upload-thumbnail', [App\Http\Controllers\Api\Admin\PortfolioVideoController::class, 'uploadThumbnail']);
    });

    // Sales
    Route::prefix('sales')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\SaleController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\Admin\SaleController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\Admin\SaleController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Api\Admin\SaleController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\SaleController::class, 'destroy']);
        Route::put('/{id}/toggle', [App\Http\Controllers\Api\Admin\SaleController::class, 'toggle']);
    });

    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\UserManagementController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\Admin\UserManagementController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\Api\Admin\UserManagementController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\UserManagementController::class, 'destroy']);
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
