<?php

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

require __DIR__ . '/api/public.php';
require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/cart.php';
require __DIR__ . '/api/customer.php';
require __DIR__ . '/api/admin.php';
