<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Parent categories first (no parent_id)
        $parentCategories = [
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
                'image' => '/images/products/kitchen-hoods/fkh-h90-06s.webp',
                'icon' => 'kitchen-hood',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
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
                'image' => '/images/products/kitchen-hobs/fbh-g90-5sbf.webp',
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
                'image' => '/images/products/oven-toasters/fot-2501c-full.webp',
                'icon' => 'oven',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
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
                'image' => '/images/products/air-fryers/faf-801wd.webp',
                'icon' => 'air-fryer',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
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
                'image' => '/images/products/water-coolers/fe-150-ss.webp',
                'icon' => 'water-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
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
                'image' => '/images/products/accessories/fac-bl3.webp',
                'icon' => 'blender',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Water Dispensers',
                'slug' => 'water-dispensers',
                'description' => 'Compact water dispensers for home and office use.',
                'features' => [
                    'Food-grade stainless steel tanks',
                    'Eco-friendly refrigerants',
                    '100% copper coiling',
                ],
                'image' => '/images/products/water-dispensers/fwd-fountain.webp',
                'icon' => 'dispenser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
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
                'image' => '/images/products/hybrid-geysers/fhg-65g.webp',
                'icon' => 'gas-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 8,
            ],
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
                'image' => '/images/products/cooking-ranges/fcr-5bb.webp',
                'icon' => 'cooking-range',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 9,
            ],
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
                'image' => '/images/products/water-coolers/fe-100-ss.webp',
                'icon' => 'room-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
        ];

        // Create parent categories
        foreach ($parentCategories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['parent_id' => null])
            );
        }

        // Now create subcategories with parent_id references
        $geysersParent = Category::where('slug', 'geysers-heaters')->first();
        $waterCoolersParent = Category::where('slug', 'water-coolers')->first();

        $subCategories = [
            // Geysers & Heaters subcategories
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
                'image' => '/images/products/gas-water-heaters/fgg-55g.webp',
                'icon' => 'gas-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 11,
                'parent_id' => $geysersParent?->id,
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
                'image' => '/images/products/hybrid-geysers/fhg-65g.webp',
                'icon' => 'hybrid-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 12,
                'parent_id' => $geysersParent?->id,
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
                'image' => '/images/products/fast-electric-water-heaters/ffeg-f100.webp',
                'icon' => 'electric-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 13,
                'parent_id' => $geysersParent?->id,
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
                'image' => '/images/products/instant-electric-water-heaters/fiewhs-25l.webp',
                'icon' => 'instant-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 14,
                'parent_id' => $geysersParent?->id,
            ],
            // Water Coolers subcategories
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
                'image' => '/images/products/slim-water-coolers/fe-35-slim.webp',
                'icon' => 'slim-cooler',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 15,
                'parent_id' => $waterCoolersParent?->id,
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
                'image' => '/images/products/storage-coolers/fst-200.webp',
                'icon' => 'storage-cooler',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 16,
                'parent_id' => $waterCoolersParent?->id,
            ],
        ];

        foreach ($subCategories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        // Delete old Accessories category if it exists (replaced by Blenders & Processors)
        Category::where('slug', 'accessories')->delete();
    }
}
