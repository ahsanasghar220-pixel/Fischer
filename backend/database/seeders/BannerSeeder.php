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
                'image' => '/images/banners/banner-water-coolers.webp',
                'link_url' => '/category/water-coolers',
                'link_text' => 'Shop Water Coolers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Geysers & Water Heaters',
                'subtitle' => 'Stay Warm This Winter',
                'image' => '/images/banners/banner-geysers.webp',
                'link_url' => '/category/geysers-heaters',
                'link_text' => 'View Geysers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Professional Cooking Ranges',
                'subtitle' => 'Cook Like a Pro',
                'image' => '/images/banners/banner-cooking.webp',
                'link_url' => '/category/cooking-ranges',
                'link_text' => 'Explore Ranges',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Modern Kitchen Hobs & Hoods',
                'subtitle' => 'Transform Your Kitchen',
                'image' => '/images/banners/banner-hobs.webp',
                'link_url' => '/category/built-in-hobs',
                'link_text' => 'View Collection',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Become a Fischer Dealer',
                'subtitle' => 'Partner With Us',
                'image' => '/images/banners/banner-dealer.webp',
                'link_url' => '/become-a-dealer',
                'link_text' => 'Apply Now',
                'position' => 'home_secondary',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Service & Support',
                'subtitle' => '1 Year Warranty',
                'image' => '/images/banners/banner-service.webp',
                'link_url' => '/service-repair',
                'link_text' => 'Request Service',
                'position' => 'home_secondary',
                'is_active' => true,
                'sort_order' => 2,
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
