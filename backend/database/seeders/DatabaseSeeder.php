<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            BrandSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            SettingsSeeder::class,
            BannerSeeder::class,
            PageSeeder::class,
            HomepageSeeder::class,
        ]);
    }
}
