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

// Run migrations route (temporary - remove after use)
Route::get('/run-migrations', function () {
    try {
        // First, check which tables need to be created
        $results = [];

        // Tables that should exist
        $requiredTables = [
            'bundles', 'bundle_items', 'bundle_slots', 'bundle_slot_products', 'bundle_images',
            'visitor_sessions', 'visitor_events'
        ];

        foreach ($requiredTables as $table) {
            if (!\Schema::hasTable($table)) {
                $results['missing'][] = $table;
            } else {
                $results['existing'][] = $table;
            }
        }

        // Try to run migrations, but catch individual errors
        try {
            \Artisan::call('migrate', ['--force' => true]);
            $results['migrate_output'] = \Artisan::output();
        } catch (\Exception $e) {
            $results['migrate_error'] = $e->getMessage();

            // If migration failed, try to create just the bundles table
            if (!empty($results['missing'])) {
                foreach ($results['missing'] as $table) {
                    try {
                        if ($table === 'bundles' && !\Schema::hasTable('bundles')) {
                            \Schema::create('bundles', function ($t) {
                                $t->id();
                                $t->string('name');
                                $t->string('slug')->unique();
                                $t->string('sku')->unique()->nullable();
                                $t->text('description')->nullable();
                                $t->string('short_description', 500)->nullable();
                                $t->enum('discount_type', ['fixed_price', 'percentage'])->default('percentage');
                                $t->decimal('discount_value', 10, 2)->default(0);
                                $t->string('badge_label', 50)->nullable();
                                $t->string('badge_color', 20)->nullable();
                                $t->string('theme_color', 20)->nullable();
                                $t->string('featured_image')->nullable();
                                $t->json('gallery_images')->nullable();
                                $t->string('video_url')->nullable();
                                $t->boolean('is_active')->default(true);
                                $t->timestamp('starts_at')->nullable();
                                $t->timestamp('ends_at')->nullable();
                                $t->integer('stock_limit')->nullable();
                                $t->integer('stock_sold')->default(0);
                                $t->enum('bundle_type', ['fixed', 'configurable'])->default('fixed');
                                $t->enum('cart_display', ['single_item', 'grouped', 'individual'])->default('grouped');
                                $t->boolean('allow_coupon_stacking')->default(false);
                                $t->boolean('show_on_homepage')->default(false);
                                $t->enum('homepage_position', ['carousel', 'grid', 'banner'])->nullable();
                                $t->integer('display_order')->default(0);
                                $t->string('meta_title')->nullable();
                                $t->string('meta_description', 500)->nullable();
                                $t->json('meta_keywords')->nullable();
                                $t->string('cta_text', 100)->nullable();
                                $t->boolean('show_countdown')->default(true);
                                $t->boolean('show_savings')->default(true);
                                $t->integer('view_count')->default(0);
                                $t->integer('add_to_cart_count')->default(0);
                                $t->integer('purchase_count')->default(0);
                                $t->decimal('revenue', 12, 2)->default(0);
                                $t->timestamps();
                                $t->softDeletes();
                            });
                            $results['created'][] = 'bundles';
                        }

                        if ($table === 'bundle_items' && !\Schema::hasTable('bundle_items')) {
                            \Schema::create('bundle_items', function ($t) {
                                $t->id();
                                $t->foreignId('bundle_id')->constrained()->onDelete('cascade');
                                $t->foreignId('product_id')->constrained()->onDelete('cascade');
                                $t->integer('quantity')->default(1);
                                $t->decimal('price_override', 10, 2)->nullable();
                                $t->integer('sort_order')->default(0);
                                $t->timestamps();
                            });
                            $results['created'][] = 'bundle_items';
                        }

                        if ($table === 'bundle_slots' && !\Schema::hasTable('bundle_slots')) {
                            \Schema::create('bundle_slots', function ($t) {
                                $t->id();
                                $t->foreignId('bundle_id')->constrained()->onDelete('cascade');
                                $t->string('name', 100);
                                $t->text('description')->nullable();
                                $t->integer('slot_order')->default(0);
                                $t->boolean('is_required')->default(true);
                                $t->integer('min_selections')->default(1);
                                $t->integer('max_selections')->default(1);
                                $t->timestamps();
                            });
                            $results['created'][] = 'bundle_slots';
                        }

                        if ($table === 'bundle_slot_products' && !\Schema::hasTable('bundle_slot_products')) {
                            \Schema::create('bundle_slot_products', function ($t) {
                                $t->id();
                                $t->foreignId('bundle_slot_id')->constrained()->onDelete('cascade');
                                $t->foreignId('product_id')->constrained()->onDelete('cascade');
                                $t->decimal('price_override', 10, 2)->nullable();
                                $t->timestamps();
                            });
                            $results['created'][] = 'bundle_slot_products';
                        }

                        if ($table === 'bundle_images' && !\Schema::hasTable('bundle_images')) {
                            \Schema::create('bundle_images', function ($t) {
                                $t->id();
                                $t->foreignId('bundle_id')->constrained()->onDelete('cascade');
                                $t->string('image');
                                $t->string('alt_text')->nullable();
                                $t->boolean('is_primary')->default(false);
                                $t->integer('sort_order')->default(0);
                                $t->timestamps();
                            });
                            $results['created'][] = 'bundle_images';
                        }
                    } catch (\Exception $tableError) {
                        $results['table_errors'][$table] = $tableError->getMessage();
                    }
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'results' => $results,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Debug bundles route (temporary)
Route::get('/debug-bundles', function () {
    try {
        $bundles = \App\Models\Bundle::with(['items.product.images', 'slots', 'images'])->limit(1)->get();

        if ($bundles->isEmpty()) {
            return response()->json(['message' => 'No bundles found', 'count' => 0]);
        }

        $bundle = $bundles->first();

        // Test each part
        $result = [
            'bundle_id' => $bundle->id,
            'bundle_name' => $bundle->name,
            'items_count' => $bundle->items->count(),
            'slots_count' => $bundle->slots->count(),
        ];

        // Test pricing service
        try {
            $pricingService = app(\App\Services\BundlePricingService::class);
            $pricing = $pricingService->getPricingBreakdown($bundle);
            $result['pricing'] = $pricing;
        } catch (\Exception $e) {
            $result['pricing_error'] = $e->getMessage();
        }

        // Test conversion methods
        try {
            $result['conversion_rate'] = $bundle->getConversionRate();
            $result['add_to_cart_rate'] = $bundle->getAddToCartRate();
        } catch (\Exception $e) {
            $result['conversion_error'] = $e->getMessage();
        }

        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
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
// Excludes: api, storage, sanctum, up, clear-cache, debug-bundles, reset-admin-password, run-migrations
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|storage|sanctum|up|clear-cache|debug-bundles|reset-admin-password|run-migrations).*$');
