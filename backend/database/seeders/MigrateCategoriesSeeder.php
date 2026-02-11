<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MigrateCategoriesSeeder extends Seeder
{
    /**
     * Migrate products from old categories to new ones and delete old categories.
     */
    public function run(): void
    {
        $migrations = [
            // Old slug => New slug
            'kitchen-hoods' => 'built-in-hoods',
            'kitchen-hobs' => 'built-in-hobs',
            'electric-gas-geysers' => 'hybrid-geysers',
            'slim-electric-water-coolers' => 'slim-water-coolers',
            'self-contained-storage-coolers' => 'storage-type-water-coolers',
        ];

        foreach ($migrations as $oldSlug => $newSlug) {
            $oldCategory = Category::where('slug', $oldSlug)->first();
            $newCategory = Category::where('slug', $newSlug)->first();

            if ($oldCategory && $newCategory) {
                // Get product count before migration
                $productCount = $oldCategory->products()->count();

                if ($productCount > 0) {
                    echo "Migrating {$productCount} products from '{$oldCategory->name}' to '{$newCategory->name}'\n";

                    // Update all products to use new category
                    DB::table('products')
                        ->where('category_id', $oldCategory->id)
                        ->update(['category_id' => $newCategory->id]);

                    echo "✓ Migrated {$productCount} products\n";
                }

                // Delete old category
                $oldCategory->delete();
                echo "✓ Deleted old category '{$oldCategory->name}'\n\n";
            }
        }

        echo "Category migration completed!\n";
    }
}
