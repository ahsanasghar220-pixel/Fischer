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

// Reset admin password route (temporary - remove after use)
Route::get('/reset-admin-password', function () {
    try {
        $user = \App\Models\User::where('email', 'admin@fischer.pk')->first();

        if (!$user) {
            return response()->json(['error' => 'Admin user not found'], 404);
        }

        // Set password directly without going through the cast
        \DB::table('users')
            ->where('email', 'admin@fischer.pk')
            ->update(['password' => \Hash::make('admin123')]);

        // Clear caches
        \Artisan::call('cache:clear');

        return response()->json([
            'status' => 'success',
            'message' => 'Admin password reset to: admin123',
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Catch-all route for SPA - serves the React app
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|storage|sanctum).*$');
