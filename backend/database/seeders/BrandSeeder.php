<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        Brand::create([
            'name' => 'Fischer',
            'slug' => 'fischer',
            'description' => 'Fischer (Fatima Engineering Works) - Leading Pakistani appliances brand established in 1990. ISO 9001-2008 certified and PSQCA approved manufacturer of water coolers, geysers, cooking ranges and chillers.',
            'logo' => '/images/logo.png',
            'website' => 'https://fischerpk.com',
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }
}
