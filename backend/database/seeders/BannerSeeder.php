<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Premium Water Coolers',
                'subtitle' => 'Cooling Solutions for Every Need',
                'image' => '/images/banners/water-coolers-banner.webp',
                'link_url' => '/category/water-coolers',
                'link_text' => 'Shop Water Coolers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Geysers & Water Heaters',
                'subtitle' => 'Stay Warm This Winter',
                'image' => '/images/banners/geyser-banner.webp',
                'link_url' => '/category/hybrid-geysers',
                'link_text' => 'View Geysers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Premium Oven Toasters',
                'subtitle' => 'Bake With Precision',
                'image' => '/images/banners/ovens-banner.webp',
                'link_url' => '/category/oven-toasters',
                'link_text' => 'Explore Ovens',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Modern Kitchen Hobs & Hoods',
                'subtitle' => 'Transform Your Kitchen',
                'image' => '/images/banners/hood-hob-banner.webp',
                'link_url' => '/category/kitchen-hobs',
                'link_text' => 'View Collection',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Healthy Air Fryers',
                'subtitle' => 'Oil-Free Cooking Solutions',
                'image' => '/images/banners/air-fryer-banner.webp',
                'link_url' => '/category/air-fryers',
                'link_text' => 'Shop Air Fryers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::firstOrCreate(
                ['title' => $banner['title'], 'position' => $banner['position']],
                $banner
            );
        }
    }
}
