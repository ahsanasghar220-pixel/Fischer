<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Data migration: keep only Standard and Express delivery methods.
 * Deactivates the legacy "Free Shipping" method (free delivery is
 * handled per-zone in the Lahore shipping zone, not as a separate method).
 * Also refreshes the method descriptions to reflect the current UX.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('shipping_methods')) {
            return;
        }

        // Deactivate "Free Shipping" — free delivery is managed per shipping zone
        DB::table('shipping_methods')
            ->where('code', 'free')
            ->update(['is_active' => false, 'updated_at' => now()]);

        // Update Standard Delivery description
        DB::table('shipping_methods')
            ->where('code', 'standard')
            ->update([
                'description' => 'Free delivery in Lahore. Rs. 200 for other cities.',
                'updated_at'  => now(),
            ]);

        // Update Express Delivery description
        DB::table('shipping_methods')
            ->where('code', 'express')
            ->update([
                'description' => 'Priority handling + express courier. Delivery in 1–2 business days.',
                'updated_at'  => now(),
            ]);
    }

    public function down(): void
    {
        if (!Schema::hasTable('shipping_methods')) {
            return;
        }

        DB::table('shipping_methods')
            ->where('code', 'free')
            ->update(['is_active' => true, 'updated_at' => now()]);
    }
};
