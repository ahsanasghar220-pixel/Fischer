<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingMethodsSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Standard Delivery',
                'code' => 'standard',
                'description' => 'Regular delivery within 3-5 business days',
                'calculation_type' => 'flat',
                'base_cost' => 200.00,
                'per_kg_cost' => 0,
                'per_item_cost' => 0,
                'free_shipping_threshold' => 10000,
                'min_delivery_days' => 3,
                'max_delivery_days' => 5,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Express Delivery',
                'code' => 'express',
                'description' => 'Fast delivery within 1-2 business days',
                'calculation_type' => 'flat',
                'base_cost' => 500.00,
                'per_kg_cost' => 0,
                'per_item_cost' => 0,
                'free_shipping_threshold' => 15000,
                'min_delivery_days' => 1,
                'max_delivery_days' => 2,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($methods as $method) {
            // Check if method already exists
            $exists = DB::table('shipping_methods')
                ->where('code', $method['code'])
                ->exists();

            if (!$exists) {
                DB::table('shipping_methods')->insert($method);
            }
        }

        // Now set up zone rates for existing zones
        $zones = DB::table('shipping_zones')->where('is_active', true)->get();
        $methodsData = DB::table('shipping_methods')->where('is_active', true)->get();

        foreach ($zones as $zone) {
            foreach ($methodsData as $method) {
                // Check if rate already exists
                $rateExists = DB::table('shipping_zone_rates')
                    ->where('shipping_zone_id', $zone->id)
                    ->where('shipping_method_id', $method->id)
                    ->exists();

                if (!$rateExists) {
                    $rate = 0;
                    $freeThreshold = null;

                    // Lahore gets free delivery
                    if (stripos($zone->name, 'lahore') !== false) {
                        $rate = 0;
                        $freeThreshold = 0;
                    } else {
                        // Other zones use method's base cost
                        $rate = $method->base_cost;
                        $freeThreshold = $method->free_shipping_threshold;
                    }

                    DB::table('shipping_zone_rates')->insert([
                        'shipping_zone_id' => $zone->id,
                        'shipping_method_id' => $method->id,
                        'rate' => $rate,
                        'per_kg_rate' => $method->per_kg_cost,
                        'free_shipping_threshold' => $freeThreshold,
                        'min_delivery_days' => $method->min_delivery_days,
                        'max_delivery_days' => $method->max_delivery_days,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
