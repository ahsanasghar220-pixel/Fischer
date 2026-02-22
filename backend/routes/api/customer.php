<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\DealerController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Customer Routes (requires auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
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
        Route::post('/check', [WishlistController::class, 'check']);
        Route::post('/{productId}', [WishlistController::class, 'add']);
        Route::delete('/{productId}', [WishlistController::class, 'remove']);
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

    // Dealer portal
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
