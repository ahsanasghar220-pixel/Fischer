<?php

use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\BundleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Cart & Checkout Routes (guests and authenticated users)
|--------------------------------------------------------------------------
*/

// Cart (works for both guests and authenticated users)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'add']);
    Route::put('/items/{itemId}', [CartController::class, 'update']);
    Route::delete('/items/{itemId}', [CartController::class, 'remove']);
    Route::delete('/clear', [CartController::class, 'clear']);
    Route::post('/coupon', [CartController::class, 'applyCoupon']);
    Route::delete('/coupon', [CartController::class, 'removeCoupon']);
    Route::post('/bundle', [BundleController::class, 'addToCart']);
});

// Shipping methods (GET for frontend compatibility)
Route::get('/shipping/methods', [CheckoutController::class, 'getShippingMethods']);

// Checkout
Route::prefix('checkout')->group(function () {
    Route::post('/shipping-methods', [CheckoutController::class, 'getShippingMethods']);
    Route::post('/calculate-totals', [CheckoutController::class, 'calculateTotals']);
    Route::post('/place-order', [CheckoutController::class, 'placeOrder']);
});
