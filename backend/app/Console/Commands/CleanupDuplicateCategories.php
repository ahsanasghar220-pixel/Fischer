<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateCategories extends Command
{
    protected $signature = 'categories:cleanup';
    protected $description = 'Remove duplicate categories, keeping the one with most products';

    public function handle()
    {
        $this->info('Checking for duplicate categories...');

        // Find duplicates
        $duplicates = DB::table('categories')
            ->select('name', 'parent_id', DB::raw('COUNT(*) as count'))
            ->groupBy('name', 'parent_id')
            ->having('count', '>', 1)
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('No duplicate categories found.');
            return 0;
        }

        $this->info("Found {$duplicates->count()} duplicate category groups.");

        foreach ($duplicates as $duplicate) {
            $this->line("Processing: {$duplicate->name}");

            // Get all categories with this name and parent_id
            $categories = DB::table('categories')
                ->leftJoin('products', 'categories.id', '=', 'products.category_id')
                ->select('categories.id', 'categories.name', DB::raw('COUNT(products.id) as product_count'))
                ->where('categories.name', $duplicate->name)
                ->where(function ($q) use ($duplicate) {
                    if ($duplicate->parent_id === null) {
                        $q->whereNull('categories.parent_id');
                    } else {
                        $q->where('categories.parent_id', $duplicate->parent_id);
                    }
                })
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('product_count')
                ->get();

            // Keep the category with the most products (first one after sorting)
            $keepId = $categories->first()->id;
            $deleteIds = $categories->skip(1)->pluck('id');

            $this->line("  Keeping ID: {$keepId}, Removing IDs: " . $deleteIds->implode(', '));

            // Move products from duplicates to the kept category
            $movedProducts = DB::table('products')
                ->whereIn('category_id', $deleteIds)
                ->update(['category_id' => $keepId]);

            if ($movedProducts > 0) {
                $this->line("  Moved {$movedProducts} products to category ID {$keepId}");
            }

            // Move child categories to the kept parent
            $movedChildren = DB::table('categories')
                ->whereIn('parent_id', $deleteIds)
                ->update(['parent_id' => $keepId]);

            if ($movedChildren > 0) {
                $this->line("  Moved {$movedChildren} child categories to parent ID {$keepId}");
            }

            // Delete the duplicates
            $deleted = DB::table('categories')
                ->whereIn('id', $deleteIds)
                ->delete();

            $this->info("  Deleted {$deleted} duplicate categories");
        }

        $this->info('Cleanup complete!');
        return 0;
    }
}
