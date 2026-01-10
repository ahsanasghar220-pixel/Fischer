<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Clean up duplicate categories
     */
    public function up(): void
    {
        // Find and remove duplicate categories, keeping only the one with products
        $duplicates = DB::table('categories')
            ->select('name', 'parent_id', DB::raw('COUNT(*) as count'), DB::raw('MIN(id) as keep_id'))
            ->groupBy('name', 'parent_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            // Get all duplicate category IDs except the one to keep
            $duplicateIds = DB::table('categories')
                ->where('name', $duplicate->name)
                ->where(function ($q) use ($duplicate) {
                    if ($duplicate->parent_id === null) {
                        $q->whereNull('parent_id');
                    } else {
                        $q->where('parent_id', $duplicate->parent_id);
                    }
                })
                ->where('id', '!=', $duplicate->keep_id)
                ->pluck('id');

            // Move any products from duplicate categories to the kept category
            DB::table('products')
                ->whereIn('category_id', $duplicateIds)
                ->update(['category_id' => $duplicate->keep_id]);

            // Move any child categories to the kept parent
            DB::table('categories')
                ->whereIn('parent_id', $duplicateIds)
                ->update(['parent_id' => $duplicate->keep_id]);

            // Delete the duplicate categories
            DB::table('categories')
                ->whereIn('id', $duplicateIds)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse - duplicates are permanently removed
    }
};
