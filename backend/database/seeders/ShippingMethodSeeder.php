<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Standard Delivery',
                'code' => 'standard',
                'description' => 'Regular delivery service',
                'calculation_type' => 'flat',
                'base_cost' => 250.00,
                'per_kg_cost' => 0,
                'per_item_cost' => 0,
                'free_shipping_threshold' => 10000.00,
                'min_delivery_days' => 3,
                'max_delivery_days' => 5,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Express Delivery',
                'code' => 'express',
                'description' => 'Fast delivery within 1-2 business days',
                'calculation_type' => 'flat',
                'base_cost' => 500.00,
                'per_kg_cost' => 0,
                'per_item_cost' => 0,
                'free_shipping_threshold' => null,
                'min_delivery_days' => 1,
                'max_delivery_days' => 2,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Free Shipping',
                'code' => 'free',
                'description' => 'Free shipping on orders over Rs. 10,000',
                'calculation_type' => 'flat',
                'base_cost' => 0,
                'per_kg_cost' => 0,
                'per_item_cost' => 0,
                'free_shipping_threshold' => 0,
                'min_delivery_days' => 5,
                'max_delivery_days' => 7,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($methods as $method) {
            ShippingMethod::firstOrCreate(
                ['code' => $method['code']],
                $method
            );
        }
    }
}
