<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        // Only two active delivery options:
        // 1. Standard Delivery — free in Lahore (managed via ShippingZone rates), Rs 200 elsewhere
        // 2. Express Delivery — paid priority service
        $methods = [
            [
                'name'                    => 'Standard Delivery',
                'code'                    => 'standard',
                'description'             => 'Free delivery in Lahore. Rs. 200 for other cities.',
                'calculation_type'        => 'flat',
                'base_cost'               => 200.00,
                'per_kg_cost'             => 0,
                'per_item_cost'           => 0,
                'free_shipping_threshold' => null,
                'min_delivery_days'       => 3,
                'max_delivery_days'       => 5,
                'is_active'               => true,
                'sort_order'              => 1,
            ],
            [
                'name'                    => 'Express Delivery',
                'code'                    => 'express',
                'description'             => 'Priority handling + express courier. Delivery in 1–2 business days.',
                'calculation_type'        => 'flat',
                'base_cost'               => 500.00,
                'per_kg_cost'             => 0,
                'per_item_cost'           => 0,
                'free_shipping_threshold' => null,
                'min_delivery_days'       => 1,
                'max_delivery_days'       => 2,
                'is_active'               => true,
                'sort_order'              => 2,
            ],
        ];

        // Use updateOrCreate so every deploy refreshes descriptions/costs
        foreach ($methods as $method) {
            ShippingMethod::updateOrCreate(
                ['code' => $method['code']],
                $method
            );
        }

        // Deactivate legacy "Free Shipping" method — free delivery is per-zone now
        ShippingMethod::where('code', 'free')->update(['is_active' => false]);
    }
}
