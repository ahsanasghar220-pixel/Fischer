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
                'code'                    => 'standard',
                // Fields updated every deploy (safe to overwrite — admin doesn't change these):
                'update' => [
                    'name'                    => 'Standard Delivery',
                    'description'             => 'Free delivery in Lahore. Rs. 200 for other cities.',
                    'calculation_type'        => 'flat',
                    'base_cost'               => 200.00,
                    'per_kg_cost'             => 0,
                    'per_item_cost'           => 0,
                    'free_shipping_threshold' => null,
                    'min_delivery_days'       => 3,
                    'max_delivery_days'       => 5,
                ],
                // Fields only set on first creation — admin can change these via UI:
                'create_only' => [
                    'is_active'  => true,
                    'sort_order' => 1,
                ],
            ],
            [
                'code'   => 'express',
                'update' => [
                    'name'                    => 'Express Delivery',
                    'description'             => 'Priority handling + express courier. Delivery in 1–2 business days.',
                    'calculation_type'        => 'flat',
                    'base_cost'               => 500.00,
                    'per_kg_cost'             => 0,
                    'per_item_cost'           => 0,
                    'free_shipping_threshold' => null,
                    'min_delivery_days'       => 1,
                    'max_delivery_days'       => 2,
                ],
                'create_only' => [
                    'is_active'  => true,
                    'sort_order' => 2,
                ],
            ],
        ];

        // updateOrCreate but is_active/sort_order are ONLY written on first insert,
        // so admin changes via the UI are never overwritten on deploy.
        foreach ($methods as $method) {
            $existing = ShippingMethod::where('code', $method['code'])->first();
            if ($existing) {
                $existing->update($method['update']);
            } else {
                ShippingMethod::create(array_merge(
                    ['code' => $method['code']],
                    $method['update'],
                    $method['create_only']
                ));
            }
        }

        // Deactivate legacy "Free Shipping" method — free delivery is per-zone now
        ShippingMethod::where('code', 'free')->update(['is_active' => false]);
    }
}
