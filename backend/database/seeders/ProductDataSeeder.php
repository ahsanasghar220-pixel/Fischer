<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

/**
 * Syncs all product and category data from the exported JSON file.
 * Run with: php artisan db:seed --class=ProductDataSeeder
 */
class ProductDataSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('seeders/product_data.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("product_data.json not found at: {$jsonPath}");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        if (!$data) {
            $this->command->error('Failed to parse product_data.json');
            return;
        }

        // Sync categories first
        $this->syncCategories($data['categories'] ?? []);

        // Then sync products
        $this->syncProducts($data['products'] ?? []);
    }

    protected function syncCategories(array $categories): void
    {
        foreach ($categories as $catData) {
            Category::updateOrCreate(
                ['slug' => $catData['slug']],
                [
                    'name' => $catData['name'],
                    'description' => $catData['description'],
                    'features' => $catData['features'],
                    'image' => $catData['image'],
                    'icon' => $catData['icon'] ?? null,
                    'is_active' => $catData['is_active'] ?? true,
                    'sort_order' => $catData['sort_order'] ?? 0,
                ]
            );
        }

        $this->command->info("Synced " . count($categories) . " categories.");
    }

    protected function syncProducts(array $products): void
    {
        $synced = 0;
        $created = 0;

        foreach ($products as $productData) {
            // Find category by slug
            $category = Category::where('slug', $productData['category_slug'])->first();

            if (!$category) {
                $this->command->warn("Category not found for slug: {$productData['category_slug']} — skipping product: {$productData['name']}");
                continue;
            }

            // Update or create product by SKU (most reliable unique identifier)
            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                [
                    'category_id' => $category->id,
                    'name' => $productData['name'],
                    'slug' => $productData['slug'],
                    'model_number' => $productData['model_number'],
                    'short_description' => $productData['short_description'],
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'compare_price' => $productData['compare_price'],
                    'cost_price' => $productData['cost_price'],
                    'dealer_price' => $productData['dealer_price'],
                    'stock_quantity' => $productData['stock_quantity'] ?? 100,
                    'stock_status' => $productData['stock_status'] ?? 'in_stock',
                    'is_active' => $productData['is_active'] ?? true,
                    'is_featured' => $productData['is_featured'] ?? false,
                    'is_new' => $productData['is_new'] ?? false,
                    'is_bestseller' => $productData['is_bestseller'] ?? false,
                    'warranty_period' => $productData['warranty_period'],
                    'specifications' => $productData['specifications'],
                ]
            );

            if ($product->wasRecentlyCreated) {
                $created++;
            }

            // Sync images — clear existing and re-insert
            if (!empty($productData['images'])) {
                ProductImage::where('product_id', $product->id)->delete();

                foreach ($productData['images'] as $imgData) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $imgData['image'],
                        'is_primary' => $imgData['is_primary'] ?? false,
                        'sort_order' => $imgData['sort_order'] ?? 0,
                    ]);
                }
            }

            $synced++;
        }

        $this->command->info("Synced {$synced} products ({$created} newly created).");
    }
}
