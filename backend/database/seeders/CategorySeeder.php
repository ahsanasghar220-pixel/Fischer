<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Exactly 9 flat categories — no sub-categories
        $categories = [
            [
                'name' => 'Kitchen Hoods',
                'slug' => 'kitchen-hoods',
                'description' => 'Premium built-in kitchen hoods with powerful airflow up to 1500 m³/h. Features include touch control, auto-clean, and energy-efficient BLDC motors.',
                'features' => [
                    'Premium Quality',
                    'BLDC Copper Motor',
                    '1 Year Warranty',
                    'Energy Efficient',
                    'Heat + Auto Clean',
                    'Touch & Gesture Control',
                    'A+++ Inverter Tech',
                    'Low Noise Level',
                ],
                'image' => '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
                'icon' => 'kitchen-hood',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Kitchen Hobs',
                'slug' => 'kitchen-hobs',
                'description' => 'Built-in kitchen hobs with tempered glass or stainless steel panels. Available in 3 to 5 burner configurations with brass burners and flame failure devices.',
                'features' => [
                    'Complete Brass Burners',
                    'Sabaf Burners',
                    'EPS Burners',
                    'Tempered Glass',
                    'Flame Failure Device',
                    'Stainless Steel Finish',
                    '5KW Powerful Burners',
                    'Auto Ignition',
                ],
                'image' => '/images/products/kitchen-hobs/FBH-SS90-5SBF/1.webp',
                'icon' => 'kitchen-hob',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Cooking Ranges',
                'slug' => 'cooking-ranges',
                'description' => 'Professional cooking ranges with 3 to 5 burners. Perfect for modern kitchens with complete brass burners and stainless steel finish.',
                'features' => [
                    'Complete Brass Burners',
                    'Sabaf Burners',
                    'Tempered Glass',
                    'Flame Failure Device',
                    'Stainless Steel Finish',
                    '5KW Powerful Burners',
                    'Auto Ignition',
                    'Multiple Size Options',
                ],
                'image' => '/images/products/cooking-ranges/fcr-5bb.webp',
                'icon' => 'cooking-range',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Air Fryers',
                'slug' => 'air-fryers',
                'description' => 'Digital air fryers with capacities from 4L to 8L for healthy oil-free cooking. Features dual heating elements for even temperature control.',
                'features' => [
                    'Oil-Free Cooking',
                    'Digital Touch Panel',
                    'Temperature Control',
                    'Premium Molded Body',
                    'Non-Stick Coating',
                    'Dual Heating Element',
                    'Large Capacity',
                ],
                'image' => '/images/products/air-fryers/FAF-801WD/1.webp',
                'icon' => 'air-fryer',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Water Coolers',
                'slug' => 'water-coolers',
                'description' => 'Commercial and industrial electric water coolers with capacities from 35L to 1000L, including slim and storage models. Made with food-grade stainless steel.',
                'features' => [
                    'Adjustable Thermostat',
                    'Food-Grade SS Tank',
                    'High-Pressure Compressor',
                    'Push-Button Taps',
                    'Non-Magnetic Body',
                    'Brand New Compressor',
                ],
                'image' => '/images/products/water-coolers/SKU FE 35 S.S.webp',
                'icon' => 'water-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Geysers & Water Heaters',
                'slug' => 'geysers-water-heaters',
                'description' => 'Electric water heaters, gas geysers, hybrid dual-fuel geysers, and instant water heaters for every need. Incoloy 840 heating elements with overheating protection.',
                'features' => [
                    'Dual Fuel Flexibility',
                    'Overheating Protection',
                    'Wattage Control',
                    'Fully Insulated',
                    'Incoloy 840 Element',
                    'Imported Brass Safety Valves',
                    'Eco Watt Technology',
                    '1 Year Warranty',
                ],
                'image' => '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp',
                'icon' => 'electric-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Oven Toasters',
                'slug' => 'oven-toasters',
                'description' => 'Digital and mechanical oven toasters with capacities from 35L to 48L. Features include rotisserie function and convection heating.',
                'features' => [
                    'Double Glass Door',
                    'Inner Lamp',
                    'Rotisserie Function',
                    'Convection Function',
                    'SS Heating Elements',
                    'Digital Controls',
                    'Large Capacity',
                ],
                'image' => '/images/products/oven-toasters/FOT-2501C/1.webp',
                'icon' => 'oven',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Water Dispensers',
                'slug' => 'water-dispensers',
                'description' => 'Compact water dispensers for home and office use. Features food-grade stainless steel tanks and eco-friendly refrigerants.',
                'features' => [
                    'Food-Grade SS Tanks',
                    'Eco-Friendly Refrigerants',
                    '100% Copper Coiling',
                    'Hot & Cold Functions',
                    'Compact Design',
                ],
                'image' => '/images/products/water-dispensers/1.webp',
                'icon' => 'dispenser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 8,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Kitchen and appliance accessories including basket liners, iron racks, and replacement parts.',
                'features' => [
                    'Durable Materials',
                    'Fischer Compatible',
                    'Affordable Prices',
                    'Easy Installation',
                ],
                'image' => '/images/products/accessories/fac-bl2.webp',
                'icon' => 'accessories',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 9,
            ],
        ];

        // Create / update all 9 categories (restore soft-deleted if needed)
        foreach ($categories as $category) {
            Category::withTrashed()->updateOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['parent_id' => null, 'deleted_at' => null])
            );
        }

        // Remove any categories not in the new 9-category structure
        Category::whereNotIn('slug', [
            'kitchen-hoods',
            'kitchen-hobs',
            'cooking-ranges',
            'air-fryers',
            'water-coolers',
            'geysers-water-heaters',
            'oven-toasters',
            'water-dispensers',
            'accessories',
        ])->delete();
    }
}
