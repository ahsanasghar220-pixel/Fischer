<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Data migration: ensure shipping zones and methods exist.
 * Idempotent — safe to run when data already exists.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('shipping_zones') || !Schema::hasTable('shipping_methods')) {
            return; // Tables not created yet (create_shipping_table migration hasn't run)
        }

        // ── Shipping Methods ──────────────────────────────────────────────────
        $methods = [
            [
                'name'                    => 'Standard Delivery',
                'code'                    => 'standard',
                'description'             => 'Regular delivery within 3-5 business days',
                'calculation_type'        => 'flat',
                'base_cost'               => 200.00,
                'per_kg_cost'             => 0.00,
                'per_item_cost'           => 0.00,
                'free_shipping_threshold' => 10000.00,
                'min_delivery_days'       => 3,
                'max_delivery_days'       => 5,
                'is_active'               => true,
                'sort_order'              => 1,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
            [
                'name'                    => 'Express Delivery',
                'code'                    => 'express',
                'description'             => 'Fast delivery within 1-2 business days',
                'calculation_type'        => 'flat',
                'base_cost'               => 500.00,
                'per_kg_cost'             => 0.00,
                'per_item_cost'           => 0.00,
                'free_shipping_threshold' => null,
                'min_delivery_days'       => 1,
                'max_delivery_days'       => 2,
                'is_active'               => true,
                'sort_order'              => 2,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
        ];

        foreach ($methods as $method) {
            if (!DB::table('shipping_methods')->where('code', $method['code'])->exists()) {
                DB::table('shipping_methods')->insert($method);
            }
        }

        // ── Shipping Zones ────────────────────────────────────────────────────
        // Lahore: free delivery
        if (!DB::table('shipping_zones')->where('name', 'Lahore')->exists()) {
            DB::table('shipping_zones')->insert([
                'name'       => 'Lahore',
                'cities'     => json_encode(['Lahore']),
                'is_active'  => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Rest of Pakistan (catch-all, empty cities array)
        if (!DB::table('shipping_zones')->where('name', 'Rest of Pakistan')->exists()) {
            DB::table('shipping_zones')->insert([
                'name'       => 'Rest of Pakistan',
                'cities'     => json_encode([]),
                'is_active'  => true,
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── Zone Rates ────────────────────────────────────────────────────────
        if (!Schema::hasTable('shipping_zone_rates')) {
            return;
        }

        $lahoreZone = DB::table('shipping_zones')->where('name', 'Lahore')->first();
        $allMethods = DB::table('shipping_methods')->where('is_active', true)->get();

        if ($lahoreZone) {
            foreach ($allMethods as $method) {
                if (!DB::table('shipping_zone_rates')
                    ->where('shipping_zone_id', $lahoreZone->id)
                    ->where('shipping_method_id', $method->id)
                    ->exists()
                ) {
                    DB::table('shipping_zone_rates')->insert([
                        'shipping_zone_id'        => $lahoreZone->id,
                        'shipping_method_id'      => $method->id,
                        'rate'                    => 0.00,
                        'per_kg_rate'             => null,
                        'free_shipping_threshold' => 0.00,
                        'min_delivery_days'       => null,
                        'max_delivery_days'       => null,
                        'created_at'              => now(),
                        'updated_at'              => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Intentionally left empty — do not delete shipping data on rollback
    }
};
