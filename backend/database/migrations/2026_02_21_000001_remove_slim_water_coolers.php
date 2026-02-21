<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // Soft-delete slim water cooler products
        DB::table('products')
            ->where('category_id', function ($q) {
                $q->select('id')->from('categories')->where('slug', 'slim-water-coolers');
            })
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now, 'is_active' => false]);

        // Soft-delete the slim-water-coolers category
        DB::table('categories')
            ->where('slug', 'slim-water-coolers')
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now]);
    }

    public function down(): void
    {
        // Restore slim-water-coolers category
        DB::table('categories')
            ->where('slug', 'slim-water-coolers')
            ->update(['deleted_at' => null]);

        // Restore its products
        DB::table('products')
            ->where('category_id', function ($q) {
                $q->select('id')->from('categories')->where('slug', 'slim-water-coolers');
            })
            ->update(['deleted_at' => null, 'is_active' => true]);
    }
};
