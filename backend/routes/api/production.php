<?php

use App\Http\Controllers\Api\Production\SalesOrderController;
use App\Http\Controllers\Api\Production\ProductionDashboardController;
use App\Http\Controllers\Api\Production\ProductionInventoryController;
use Illuminate\Support\Facades\Route;

// Product catalog routes — accessible to all portal roles
Route::middleware(['auth:sanctum', 'role:salesperson|admin|super-admin|production_manager|complaints_manager'])->group(function () {
    Route::get('/production/products/search', [SalesOrderController::class, 'searchProducts']);
    Route::get('/production/products', [SalesOrderController::class, 'browseProducts']);
    Route::get('/production/products/{product}/variants', [SalesOrderController::class, 'getProductVariants']);
});

// Stats must be registered before the {order} wildcard to avoid being matched by it
Route::middleware(['auth:sanctum', 'role:production_manager|admin|super-admin'])->group(function () {
    Route::get('/production/orders/stats', [SalesOrderController::class, 'orderStats']);
});

Route::middleware(['auth:sanctum', 'role:salesperson|admin|super-admin'])->group(function () {
    Route::get('/production/my-orders', [SalesOrderController::class, 'myOrders']);
    Route::get('/production/dealers', [SalesOrderController::class, 'dealers']);
    Route::post('/production/orders', [SalesOrderController::class, 'store']);
    Route::get('/production/orders/{order}', [SalesOrderController::class, 'show']);
});

// Production manager routes — view all orders, update status, manage inventory
Route::middleware(['auth:sanctum', 'role:production_manager|admin|super-admin'])->group(function () {
    Route::get('/production/dashboard', [ProductionDashboardController::class, 'index']);
    Route::get('/production/orders', [SalesOrderController::class, 'index']);
    Route::put('/production/orders/{order}/status', [SalesOrderController::class, 'updateStatus']);
    Route::get('/production/inventory', [ProductionInventoryController::class, 'index']);
    Route::post('/production/inventory', [ProductionInventoryController::class, 'store']);
    Route::put('/production/inventory/{inventory}', [ProductionInventoryController::class, 'update']);
});
