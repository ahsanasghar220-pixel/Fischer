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

// Catch-all route for SPA - serves the React app
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|storage|sanctum).*$');
