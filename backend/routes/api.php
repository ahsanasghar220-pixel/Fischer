<?php

use App\Http\Controllers\Api\DeployWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes are organized into sub-files for maintainability:
|
|   api/public.php   — public routes (products, categories, homepage, etc.)
|   api/auth.php     — login, register, password reset
|   api/cart.php     — cart and checkout routes
|   api/customer.php — account, orders, wishlist, addresses (auth:sanctum)
|   api/admin.php    — all admin routes (auth:sanctum + admin middleware)
|
*/

// Deploy webhook — defined here (top-level file) to guarantee it's always
// registered regardless of sub-file loading issues on the server.
Route::match(['GET', 'POST'], '/deploy-webhook', [DeployWebhookController::class, 'handle']);

require __DIR__ . '/api/public.php';
require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/cart.php';
require __DIR__ . '/api/customer.php';
require __DIR__ . '/api/admin.php';
