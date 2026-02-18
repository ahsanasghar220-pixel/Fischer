<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PortfolioVideo;

class PortfolioVideoSeeder extends Seeder
{
    public function run(): void
    {
        $videos = [
            [
                'title' => 'Fischer Water Cooler',
                'description' => 'Experience the Fischer water cooler — premium cooling technology designed for Pakistani homes and offices.',
                'video_url' => '/videos/portfolio/fischer-water-cooler-updated.mp4',
                'thumbnail' => null,
                'category' => 'Product Showcase',
                'sort_order' => 1,
                'is_visible' => true,
            ],
            [
                'title' => 'Fischer Brand Story',
                'description' => 'Our journey of bringing premium home appliances to Pakistan — quality, innovation, and trust.',
                'video_url' => '/videos/portfolio/linkedin-story.mp4',
                'thumbnail' => null,
                'category' => 'Brand Story',
                'sort_order' => 2,
                'is_visible' => true,
            ],
        ];

        foreach ($videos as $video) {
            PortfolioVideo::updateOrCreate(
                ['video_url' => $video['video_url']],
                $video
            );
        }
    }
}
