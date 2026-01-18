<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| These routes serve the SPA frontend. All requests that don't match
| API routes will be handled by the frontend's client-side router.
|
*/

// Health check
Route::get('/up', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Cache clear route (for production deployment)
Route::get('/clear-cache', function () {
    \Artisan::call('cache:clear');
    \Artisan::call('config:clear');
    \Artisan::call('route:clear');
    \Artisan::call('view:clear');

    // Clear Spatie permission cache
    try {
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    } catch (\Exception $e) {
        // Ignore if not available
    }

    return response()->json([
        'status' => 'success',
        'message' => 'All caches cleared',
        'timestamp' => now()
    ]);
});

// Catch-all route for SPA - serves the React app
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|storage|sanctum).*$');
