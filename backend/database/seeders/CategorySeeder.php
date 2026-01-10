<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Kitchen Appliances Parent
            [
                'name' => 'Kitchen Hoods',
                'slug' => 'kitchen-hoods',
                'description' => 'Premium kitchen hoods with powerful airflow up to 1500 m³/h. Features include heat auto-clean, gesture and touch controls, BLDC copper motors, and filterless operation for a modern kitchen experience.',
                'image' => '/images/categories/kitchen-hoods.png',
                'icon' => 'kitchen-hood',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Kitchen Hobs',
                'slug' => 'kitchen-hobs',
                'description' => 'Built-in kitchen hobs with tempered glass or stainless steel panels. Features brass/SABAF burners, cast iron pan supports, flame failure safety device, and battery pulse ignition.',
                'image' => '/images/categories/kitchen-hobs.png',
                'icon' => 'kitchen-hob',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            // Water Heaters Parent
            [
                'name' => 'Gas Water Heaters',
                'slug' => 'gas-water-heaters',
                'description' => 'Instant gas water heaters (geysers) with capacities from 15 to 55 gallons. Features copper heat exchangers, digital temperature control, and efficient gas consumption.',
                'image' => '/images/categories/gas-water-heaters.png',
                'icon' => 'gas-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Electric + Gas Geysers',
                'slug' => 'hybrid-geysers',
                'description' => 'Hybrid water heaters with both electric and gas heating options. Available from 15 to 100 gallons with dual-fuel flexibility for year-round hot water.',
                'image' => '/images/categories/hybrid-geysers.png',
                'icon' => 'hybrid-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Fast Electric Water Heaters',
                'slug' => 'fast-electric-water-heaters',
                'description' => 'Fast electric water heaters from 30 to 200 liters. Features single welded tanks, adjustable wattage options (800/1200/2000W), thermal safety cutouts, and full insulation.',
                'image' => '/images/categories/electric-water-heaters.png',
                'icon' => 'electric-geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Instant Electric Water Heaters',
                'slug' => 'instant-electric-water-heaters',
                'description' => 'Instant cum storage electric water heaters and instant watt heaters. Compact units from 10 to 60 liters with quick heating technology.',
                'image' => '/images/categories/instant-water-heaters.png',
                'icon' => 'instant-geyser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 6,
            ],
            // Water Cooling
            [
                'name' => 'Electric Water Coolers',
                'slug' => 'water-coolers',
                'description' => 'Commercial and industrial electric water coolers with capacities from 35 Ltr/Hr to 1000 Ltr/Hr. Features food-grade stainless steel tanks, pure copper coiling, and CFC-free R134a refrigerant.',
                'image' => '/images/categories/water-coolers.png',
                'icon' => 'water-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Slim Electric Water Coolers',
                'slug' => 'slim-water-coolers',
                'description' => 'Space-saving slim design water coolers with 35 to 65 Ltr/Hr cooling capacity. Perfect for areas with limited floor space.',
                'image' => '/images/categories/slim-water-coolers.png',
                'icon' => 'slim-cooler',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 8,
            ],
            [
                'name' => 'Water Dispensers',
                'slug' => 'water-dispensers',
                'description' => 'Compact water dispensers for home and office use. Features include hot and cold water options with space-efficient design.',
                'image' => '/images/categories/water-dispensers.png',
                'icon' => 'dispenser',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 9,
            ],
            [
                'name' => 'Self-Contained Storage Coolers',
                'slug' => 'storage-type-water-coolers',
                'description' => 'Premium storage capacity water coolers from 25 to 1000 liters. Food-grade stainless steel tanks with brand new compressors and copper fan motors.',
                'image' => '/images/categories/storage-coolers.png',
                'icon' => 'storage-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
            // Small Kitchen Appliances
            [
                'name' => 'Oven Toasters',
                'slug' => 'oven-toasters',
                'description' => 'Digital and mechanical oven toasters with capacities from 35L to 48L. Features convection cooking, multiple functions, and powerful heating elements.',
                'image' => '/images/categories/oven-toasters.png',
                'icon' => 'oven',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Air Fryers',
                'slug' => 'air-fryers',
                'description' => 'Digital air fryers with capacities from 4L to 8L. Features include touch panel controls, multiple cooking programs, and healthy oil-free cooking.',
                'image' => '/images/categories/air-fryers.png',
                'icon' => 'air-fryer',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 12,
            ],
            [
                'name' => 'Cooking Ranges',
                'slug' => 'cooking-ranges',
                'description' => 'Professional cooking ranges and cabinets with 3 to 5 burners. Features include brass burners, stainless steel body, auto ignition, and options for deep fryer, pizza baker, and roasting grill.',
                'image' => '/images/categories/cooking-ranges.png',
                'icon' => 'cooking-range',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 13,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Kitchen accessories including blenders, juicers, and irons. Quality small appliances to complement your Fischer kitchen.',
                'image' => '/images/categories/accessories.png',
                'icon' => 'accessories',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 14,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
