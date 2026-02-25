<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Use insertOrIgnore so existing admin customizations (is_enabled, etc.) are preserved
        DB::table('homepage_sections')->insertOrIgnore([
            'key'        => 'bundles',
            'title'      => 'Bundle Offers',
            'subtitle'   => 'Save more when you buy together. Explore our curated appliance bundles.',
            'is_enabled' => true,
            'sort_order' => 8,
            'settings'   => json_encode([
                'display_count' => 6,
                'show_savings'  => true,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('homepage_sections')->where('key', 'bundles')->delete();
    }
};
