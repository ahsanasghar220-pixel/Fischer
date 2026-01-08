<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Water Coolers',
                'slug' => 'water-coolers',
                'description' => 'Commercial and industrial electric water coolers with capacities ranging from 35 Ltr/Hr to 1000 Ltr/Hr. All units feature food-grade stainless steel tanks, pure copper coiling, and CFC-free R134a refrigerant.',
                'image' => '/images/categories/water-coolers.png',
                'icon' => 'water-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Storage Type Water Coolers',
                'slug' => 'storage-type-water-coolers',
                'description' => 'Premium storage capacity water coolers from 25 to 200 liters. Ideal for continuous cold water supply in offices, schools, and commercial establishments.',
                'image' => '/images/categories/storage-coolers.png',
                'icon' => 'storage-cooler',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Water Dispensers',
                'slug' => 'water-dispensers',
                'description' => 'Compact water dispensers with cooling capacity from 40 to 45 liters. Perfect for homes and small offices with space-efficient design.',
                'image' => '/images/categories/water-dispensers.png',
                'icon' => 'dispenser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Geysers & Heaters',
                'slug' => 'geysers-heaters',
                'description' => 'Electric water heaters and geysers from 30 to 200 liters. Includes instant, storage, and hybrid (electric/gas) options with imported components and thermal safety features.',
                'image' => '/images/categories/geysers.png',
                'icon' => 'geyser',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Cooking Ranges',
                'slug' => 'cooking-ranges',
                'description' => 'Professional cooking ranges and cabinets with 3 to 5 burners. Features include brass burners, stainless steel body, auto ignition, and options for deep fryer, pizza baker, and roasting grill.',
                'image' => '/images/categories/cooking-ranges.png',
                'icon' => 'cooking-range',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Built-in HOBs & Hoods',
                'slug' => 'built-in-hobs',
                'description' => 'Modern built-in kitchen hobs with tempered glass or stainless steel panels, brass/SABAF burners, and flame failure safety device. Kitchen hoods with powerful airflow and auto-clean features.',
                'image' => '/images/categories/hobs.png',
                'icon' => 'hob',
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Kitchen accessories including blenders, juicers, and irons. Quality small appliances to complement your Fischer kitchen.',
                'image' => '/images/categories/accessories.png',
                'icon' => 'accessories',
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 7,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
