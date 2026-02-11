<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // 1. Built-in Hoods
            [
                'name' => 'Built-in Hoods',
                'slug' => 'built-in-hoods',
                'description' => 'Premium built-in hoods with powerful airflow up to 1500 m³/h.',
                'features' => [
                    'Premium Quality',
                    'BLDC copper motor',
                    '1 Year Warranty',
                    'Energy Efficient',
                    'Heat + Auto clean',
                    'Gesture and Touch Control',
                    'Inverter Technology A+++ rated',
                    'Low noise level',
                ],
                'image' => '/images/products/hood.webp',
                'icon' => 'kitchen-hood',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            // 2. Built-in Hobs
            [
                'name' => 'Built-in Hobs',
                'slug' => 'built-in-hobs',
                'description' => 'Built-in hobs with tempered glass or stainless steel panels.',
                'features' => [
                    'Complete Brass Burners',
                    'Sabaf Burners',
                    'EPS Burners',
                    'Tempered Glass',
                    'Flame Failure Device',
                    'Stainless steel finish',
                    '5KW powerful burners',
                    'Immediate Auto Ignition',
                ],
                'image' => '/images/products/hob.webp',
                'icon' => 'kitchen-hob',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Oven Toasters',
                'slug' => 'oven-toasters',
                'description' => 'Digital and mechanical oven toasters with capacities from 35L to 48L.',
                'features' => [
                    'Double Layered Glass Door',
                    'Inner Lamp',
                    'Rotisserie Function',
                    'Convection Function',
                    'Stainless Steel Elements',
                ],
                'image' => '/images/categories/oven-toasters.png',
                'icon' => 'oven',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            // 4. Air Fryers
            [
                'name' => 'Air Fryers',
                'slug' => 'air-fryers',
                'description' => 'Digital air fryers with capacities from 4L to 8L for healthy oil-free cooking.',
                'features' => [
                    'Digital Touch panel',
                    'Wide Temperature Control',
                    'Injection molding texture',
                    'Non-stick coating',
                    'Dual Heating element for Even temperature control',
                ],
                'image' => '/images/categories/air-fryers.png',
                'icon' => 'air-fryer',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            // 9. Cooking Ranges (reordered from 5)
            [
                'name' => 'Cooking Ranges',
                'slug' => 'cooking-ranges',
                'description' => 'Professional cooking ranges with 3 to 5 burners.',
                'features' => [
                    'Complete Brass Burners',
                    'Sabaf Burners',
                    'Tempered Glass',
                    'Flame Failure Device',
                    'Stainless Steel Finish',
                    '5KW Powerful Burners',
                    'Immediate Auto Ignition',
                    'Multiple Size Options',
                ],
                'image' => '/images/categories/cooking-ranges.png',
                'icon' => 'cooking-range',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 9,
            ],
            // 6. Blenders & Processors
            [
                'name' => 'Blenders & Processors',
                'slug' => 'blenders-processors',
                'description' => 'Multi-function food processors and blenders.',
                'features' => [
                    'Multi-Function Food processing function',
                    'Precision stainless steel blades & Discs',
                    'Pulse & Speed control',
                    'Generous Capacity',
                ],
                'image' => '/images/products/accessories/fac-bl3.jpeg',
                'icon' => 'blender',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
            // 8. Geysers & Heaters (reordered from 7)
            [
                'name' => 'Geysers & Heaters',
                'slug' => 'geysers-heaters',
                'description' => 'Water geysers and heaters with various capacities.',
                'features' => [
                    'Overheating Protection',
                    'Wattage Control',
                    'Fully Insulated',
                    'Accurate Volume Capacity',
                    'Incoloy 840 heating element',
                    'Imported Brass safety Valves',
                ],
                'image' => '/images/categories/geysers-heaters.png',
                'icon' => 'gas-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 8,
            ],
            // Sub-categories for Geysers & Heaters
            [
                'name' => 'Gas Water Heaters',
                'slug' => 'gas-water-heaters',
                'description' => 'Instant gas water heaters with capacities from 15 to 55 gallons.',
                'features' => [
                    'Overheating Protection',
                    'Wattage Control',
                    'Fully Insulated',
                    'Accurate Volume Capacity',
                    'Copper Heat Exchangers',
                    'Digital Temperature Control',
                ],
                'image' => '/images/categories/gas-water-heaters.png',
                'icon' => 'gas-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 11,
            ],
            [
                'name' => 'Electric + Gas Geysers',
                'slug' => 'hybrid-geysers',
                'description' => 'Hybrid water heaters with both electric and gas heating options.',
                'features' => [
                    'Dual Fuel Flexibility',
                    'Overheating Protection',
                    'Wattage Control',
                    'Fully Insulated',
                    'Accurate Volume Capacity',
                    'Incoloy 840 Heating Element',
                ],
                'image' => '/images/categories/hybrid-geysers.png',
                'icon' => 'hybrid-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 12,
            ],
            [
                'name' => 'Fast Electric Water Heaters',
                'slug' => 'fast-electric-water-heaters',
                'description' => 'Fast electric water heaters from 30 to 200 liters.',
                'features' => [
                    'Single Welded Tanks',
                    'Adjustable Wattage Options',
                    'Thermal Safety Cutouts',
                    'Full Insulation',
                    'Incoloy 840 Heating Element',
                ],
                'image' => '/images/categories/electric-water-heaters.png',
                'icon' => 'electric-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 13,
            ],
            [
                'name' => 'Instant Electric Water Heaters',
                'slug' => 'instant-electric-water-heaters',
                'description' => 'Instant cum storage electric water heaters from 10 to 60 liters.',
                'features' => [
                    'Quick Heating Technology',
                    'Compact Design',
                    'Overheating Protection',
                    'Wattage Control',
                    'Fully Insulated',
                ],
                'image' => '/images/categories/instant-water-heaters.png',
                'icon' => 'instant-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 14,
            ],
            // 5. Water Coolers (reordered from 12)
            [
                'name' => 'Water Coolers',
                'slug' => 'water-coolers',
                'description' => 'Commercial and industrial electric water coolers.',
                'features' => [
                    'Adjustable Thermostat',
                    'Made of Food Grade, Non Magnetic Heavy Gauge stainless steel',
                    'High back pressure compressor with condenser',
                    'Spring loaded push button',
                ],
                'image' => '/images/categories/water-coolers.png',
                'icon' => 'water-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            // Sub-categories for Water Coolers
            [
                'name' => 'Slim Electric Water Coolers',
                'slug' => 'slim-water-coolers',
                'description' => 'Space-saving slim design water coolers.',
                'features' => [
                    'Space-Saving Design',
                    'Adjustable Thermostat',
                    'Food Grade Stainless Steel',
                    'High Back Pressure Compressor',
                ],
                'image' => '/images/categories/slim-water-coolers.png',
                'icon' => 'slim-cooler',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 15,
            ],
            // 7. Water Dispensers (reordered from 14)
            [
                'name' => 'Water Dispensers',
                'slug' => 'water-dispensers',
                'description' => 'Compact water dispensers for home and office use.',
                'features' => [
                    'Food-grade stainless steel tanks',
                    'Eco-friendly refrigerants',
                    '100% copper coiling',
                ],
                'image' => '/images/categories/water-dispensers.png',
                'icon' => 'dispenser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Self-Contained Storage Coolers',
                'slug' => 'storage-type-water-coolers',
                'description' => 'Premium storage capacity water coolers from 25 to 1000 liters.',
                'features' => [
                    'Food Grade Stainless Steel Tanks',
                    'Brand New Compressors',
                    'Copper Fan Motors',
                    'Large Storage Capacity',
                ],
                'image' => '/images/categories/storage-coolers.png',
                'icon' => 'storage-cooler',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 16,
            ],
            // 10. Room Coolers (reordered from 16)
            [
                'name' => 'Room Coolers',
                'slug' => 'room-coolers',
                'description' => 'Efficient room coolers for comfortable indoor cooling.',
                'features' => [
                    'Powerful Air Throw',
                    'Honeycomb Cooling Pads',
                    'Large Water Tank Capacity',
                    'Multiple Speed Settings',
                    'Energy Efficient',
                ],
                'image' => '/images/categories/room-coolers.png',
                'icon' => 'room-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        // Delete old Accessories category if it exists (replaced by Blenders & Processors)
        Category::where('slug', 'accessories')->delete();
    }
}
