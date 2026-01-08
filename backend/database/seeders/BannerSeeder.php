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
                'description' => 'From 35 Ltr/Hr to 1000 Ltr/Hr capacity - pure copper coiling, stainless steel tanks',
                'image' => '/images/banners/banner-water-coolers.jpg',
                'link' => '/category/water-coolers',
                'button_text' => 'Shop Water Coolers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Geysers & Water Heaters',
                'subtitle' => 'Stay Warm This Winter',
                'description' => 'Electric and hybrid geysers from 30L to 200L with thermal safety features',
                'image' => '/images/banners/banner-geysers.jpg',
                'link' => '/category/geysers-heaters',
                'button_text' => 'View Geysers',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Professional Cooking Ranges',
                'subtitle' => 'Cook Like a Pro',
                'description' => 'Brass burners, stainless steel body, auto ignition - built for performance',
                'image' => '/images/banners/banner-cooking.jpg',
                'link' => '/category/cooking-ranges',
                'button_text' => 'Explore Ranges',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Modern Kitchen Hobs & Hoods',
                'subtitle' => 'Transform Your Kitchen',
                'description' => 'Tempered glass hobs with SABAF burners and powerful range hoods',
                'image' => '/images/banners/banner-hobs.jpg',
                'link' => '/category/built-in-hobs',
                'button_text' => 'View Collection',
                'position' => 'home_hero',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Become a Fischer Dealer',
                'subtitle' => 'Partner With Us',
                'description' => 'Join our nationwide dealer network and grow your business',
                'image' => '/images/banners/banner-dealer.jpg',
                'link' => '/become-a-dealer',
                'button_text' => 'Apply Now',
                'position' => 'home_secondary',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Service & Support',
                'subtitle' => '1 Year Warranty',
                'description' => 'Expert technicians, genuine parts, quick turnaround',
                'image' => '/images/banners/banner-service.jpg',
                'link' => '/service-repair',
                'button_text' => 'Request Service',
                'position' => 'home_secondary',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}
