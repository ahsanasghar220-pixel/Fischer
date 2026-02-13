<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MigrateProductCatalog extends Command
{
    protected $signature = 'migrate:product-catalog {--dry-run : Show what would be done without making changes}';
    protected $description = 'Migrate product images to use product-catalog paths';

    private array $catalogMapping = [
        // Air Fryers
        'FAF-401WD' => [
            '/images/product-catalog/air-fryers/FAF-401WD/1.webp',
            '/images/product-catalog/air-fryers/FAF-401WD/2.webp',
        ],
        'FAF-601WD' => [
            '/images/product-catalog/air-fryers/FAF-601WD/1.webp',
            '/images/product-catalog/air-fryers/FAF-601WD/2.webp',
        ],
        'FAF-801WD' => [
            '/images/product-catalog/air-fryers/FAF-801WD/1.webp',
            '/images/product-catalog/air-fryers/FAF-801WD/2.webp',
        ],

        // Kitchen Hobs
        'FBH-G78-3CB' => [
            '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/1.webp',
            '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/2.webp',
            '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/3.webp',
        ],
        'FBH-G78-3CB-MATTE' => [
            '/images/product-catalog/kitchen-hobs/FBH-G78-3CB(MATT)/1.webp',
        ],
        'FBH-G90-5SBF' => [
            '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/1.webp',
            '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/2.webp',
            '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/3.webp',
        ],
        'FBH-SS76-3CB' => [
            '/images/product-catalog/kitchen-hobs/FBH-SS76-3CB/1.webp',
        ],
        'FBH-SS76-3EPS' => [
            '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/1.webp',
            '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/2.webp',
            '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/3.webp',
        ],
        'FBH-SS84-3SBF' => [
            '/images/product-catalog/kitchen-hobs/FBH-SS84-3SBF/1.webp',
            '/images/product-catalog/kitchen-hobs/FBH-SS84-3SBF/2.webp',
        ],
        'FBH-SS86-3CB' => [
            '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/1.webp',
            '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/2.webp',
            '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/3.webp',
        ],
        'FBH-SS90-5SBF' => [
            '/images/product-catalog/kitchen-hobs/FBH-SS90-5SBF/1.webp',
        ],

        // Kitchen Hoods
        'FKH-H90-06S' => [
            '/images/product-catalog/kitchen-hoods/FKH-H90-06S/1.webp',
        ],
        'FKH-L90-01IN' => [
            '/images/product-catalog/kitchen-hoods/FKH-L90-01IN/1.webp',
            '/images/product-catalog/kitchen-hoods/FKH-L90-01IN/2.webp',
        ],
        'FKH-S90-02IN' => [
            '/images/product-catalog/kitchen-hoods/FKH-S90-021N/1.webp',
            '/images/product-catalog/kitchen-hoods/FKH-S90-021N/2.webp',
        ],
        'FKH-T90-03IN' => [
            '/images/product-catalog/kitchen-hoods/FKH-T90-031N/1.webp',
            '/images/product-catalog/kitchen-hoods/FKH-T90-031N/2.webp',
        ],
        'FKH-T90-04SC' => [
            '/images/product-catalog/kitchen-hoods/FKH-T90-04SC/1.webp',
        ],
        'FKH-T90-05S' => [
            '/images/product-catalog/kitchen-hoods/FKH-T90-05S/2.webp',
        ],

        // Oven Toasters
        'FOT-1901D' => [
            '/images/product-catalog/oven-toasters/FOT-1901D/1.webp',
            '/images/product-catalog/oven-toasters/FOT-1901D/2.webp',
            '/images/product-catalog/oven-toasters/FOT-1901D/3.webp',
            '/images/product-catalog/oven-toasters/FOT-1901D/4.webp',
        ],
        'FOT-2501C' => [
            '/images/product-catalog/oven-toasters/FOT-2501C/1.webp',
            '/images/product-catalog/oven-toasters/FOT-2501C/2.webp',
            '/images/product-catalog/oven-toasters/FOT-2501C/3.webp',
            '/images/product-catalog/oven-toasters/FOT-2501C/4.webp',
        ],
    ];

    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        $this->info('🚀 Starting Product Catalog Migration...');
        $this->newLine();

        if ($isDryRun) {
            $this->warn('⚠️  DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        $updated = 0;
        $notFound = 0;
        $totalImages = 0;

        foreach ($this->catalogMapping as $sku => $imagePaths) {
            $product = Product::where('sku', $sku)->first();

            if (!$product) {
                $this->error("✗ Product not found: {$sku}");
                $notFound++;
                continue;
            }

            $this->info("📦 Processing: {$product->name} ({$sku})");

            // Check if images exist
            $validImages = [];
            foreach ($imagePaths as $imagePath) {
                $fullPath = public_path($imagePath);
                if (File::exists($fullPath)) {
                    $validImages[] = $imagePath;
                    $this->line("  ✓ Image found: {$imagePath}");
                } else {
                    $this->warn("  ⚠ Image missing: {$imagePath}");
                }
            }

            if (empty($validImages)) {
                $this->warn("  → No valid images found for {$sku}");
                continue;
            }

            if (!$isDryRun) {
                // Delete old images
                $oldImagesCount = ProductImage::where('product_id', $product->id)->count();
                ProductImage::where('product_id', $product->id)->delete();

                // Create new images
                foreach ($validImages as $index => $imagePath) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $imagePath,
                        'alt_text' => $product->name . ($index > 0 ? " - Image " . ($index + 1) : ''),
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }

                $this->info("  → Updated: {$oldImagesCount} old images → " . count($validImages) . " new images");
            } else {
                $oldImagesCount = ProductImage::where('product_id', $product->id)->count();
                $this->info("  → Would update: {$oldImagesCount} old images → " . count($validImages) . " new images");
            }

            $updated++;
            $totalImages += count($validImages);
            $this->newLine();
        }

        $this->newLine();
        $this->info('📊 Migration Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Products Updated', $updated],
                ['Products Not Found', $notFound],
                ['Total Images', $totalImages],
                ['Average Images/Product', $updated > 0 ? round($totalImages / $updated, 1) : 0],
            ]
        );

        if ($isDryRun) {
            $this->newLine();
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        } else {
            $this->newLine();
            $this->info('✅ Migration completed successfully!');
        }

        return 0;
    }
}
