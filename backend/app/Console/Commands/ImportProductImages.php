<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImportProductImages extends Command
{
    protected $signature = 'import:product-images {source_path}';
    protected $description = 'Import product images from source folder, convert to WebP, and replace existing images';

    private ImageManager $imageManager;
    private int $imported = 0;
    private int $skipped = 0;
    private array $notFound = [];

    // Category folder to database category slug mapping
    private array $categoryMapping = [
        'AirFryers' => 'air-fryers',
        'Kitchen Hob' => 'kitchen-hobs',
        'Kitchen Hood' => 'kitchen-hoods',
        'Oven Toaster' => 'oven-toasters',
        'water cooler' => 'water-coolers',
        'Water Dispensers' => 'water-dispensers',
        'Water Heater' => 'geysers-heaters',
    ];

    // Special model number normalizations (folder name → DB model number)
    private array $modelNormalizations = [
        'FKH-S90-021N' => 'FKH-S90-02IN',
        'FKH-T90-031N' => 'FKH-T90-03IN',
        'FBH-G78-3CB(MATT)' => 'FBH-G78-3CB (MATTE)',
    ];

    public function handle(): int
    {
        // Increase memory limit for large image processing
        ini_set('memory_limit', '1G');

        $sourcePath = $this->argument('source_path');

        if (!is_dir($sourcePath)) {
            $this->error("Source path does not exist: {$sourcePath}");
            return Command::FAILURE;
        }

        $this->imageManager = new ImageManager(new Driver());

        // Ensure the products storage directory exists
        Storage::disk('public')->makeDirectory('products');

        $this->info("Starting product image import from: {$sourcePath}");
        $this->newLine();

        // Process each category folder
        $folders = scandir($sourcePath);
        foreach ($folders as $folder) {
            if ($folder === '.' || $folder === '..') {
                continue;
            }

            $categoryPath = $sourcePath . DIRECTORY_SEPARATOR . $folder;
            if (!is_dir($categoryPath)) {
                continue;
            }

            $this->processCategory($folder, $categoryPath);
        }

        // Show summary
        $this->newLine();
        $this->info("=== Import Summary ===");
        $this->info("Products updated: {$this->imported}");
        $this->info("Products skipped: {$this->skipped}");

        if (!empty($this->notFound)) {
            $this->newLine();
            $this->warn("Products not found in database:");
            foreach ($this->notFound as $item) {
                $this->warn("  - {$item}");
            }
        }

        return Command::SUCCESS;
    }

    private function processCategory(string $categoryFolder, string $categoryPath): void
    {
        $this->info("Processing category: {$categoryFolder}");

        // Handle special categories
        if ($categoryFolder === 'water cooler') {
            $this->processWaterCoolers($categoryPath);
            return;
        }

        if ($categoryFolder === 'Water Dispensers') {
            $this->processWaterDispensers($categoryPath);
            return;
        }

        if ($categoryFolder === 'Blender' || $categoryFolder === 'Cooking Ranges') {
            // Skip empty folders
            $this->line("  Skipping (empty folder)");
            return;
        }

        if ($categoryFolder === 'Water Heater') {
            $this->processTopLevelWaterHeater($categoryPath);
            return;
        }

        // Standard processing: each subfolder is a product model number
        $items = scandir($categoryPath);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $productPath = $categoryPath . DIRECTORY_SEPARATOR . $item;
            if (!is_dir($productPath)) {
                continue;
            }

            $modelNumber = $this->normalizeModelNumber($item);
            $this->processProductFolder($modelNumber, $productPath);
        }
    }

    private function processWaterCoolers(string $categoryPath): void
    {
        // Water cooler images are named like "SKU FE 100 S.S.jpg"
        $files = scandir($categoryPath);

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $filePath = $categoryPath . DIRECTORY_SEPARATOR . $file;

            // Handle Water Heater subfolder
            if (is_dir($filePath) && $file === 'Water Heater') {
                $this->processWaterHeaterSubfolder($filePath);
                continue;
            }

            if (!is_file($filePath)) {
                continue;
            }

            // Parse SKU from filename (e.g., "SKU FE 100 S.S.jpg" → "FE-100-SS")
            $sku = $this->parseWaterCoolerSku($file);
            if (!$sku) {
                continue;
            }

            $product = Product::where('sku', $sku)
                ->orWhere('model_number', 'LIKE', '%' . str_replace('-', ' ', $sku) . '%')
                ->first();

            if (!$product) {
                $this->notFound[] = "Water Cooler: {$file} (SKU: {$sku})";
                $this->skipped++;
                continue;
            }

            $this->importSingleImage($product, $filePath, true);
        }
    }

    private function parseWaterCoolerSku(string $filename): ?string
    {
        // "SKU FE 100 S.S.jpg" → "FE-100-SS"
        if (preg_match('/SKU (FE \d+) S\.S/i', $filename, $matches)) {
            return str_replace(' ', '-', $matches[1]) . '-SS';
        }
        return null;
    }

    private function processWaterHeaterSubfolder(string $folderPath): void
    {
        $this->info("  Processing Water Heater subfolder...");

        $files = scandir($folderPath);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $filePath = $folderPath . DIRECTORY_SEPARATOR . $file;
            if (!is_file($filePath)) {
                continue;
            }

            $product = $this->matchWaterHeaterProduct($file);
            if (!$product) {
                $this->notFound[] = "Water Heater: {$file}";
                $this->skipped++;
                continue;
            }

            $this->importSingleImage($product, $filePath, true);
        }
    }

    private function processTopLevelWaterHeater(string $categoryPath): void
    {
        // Process the top-level Water Heater folder (contains single Eco Watt image)
        $files = scandir($categoryPath);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $filePath = $categoryPath . DIRECTORY_SEPARATOR . $file;
            if (!is_file($filePath)) {
                continue;
            }

            $product = $this->matchWaterHeaterProduct($file);
            if (!$product) {
                $this->notFound[] = "Water Heater (top): {$file}";
                $this->skipped++;
                continue;
            }

            $this->importSingleImage($product, $filePath, true);
        }
    }

    private function matchWaterHeaterProduct(string $filename): ?Product
    {
        $name = pathinfo($filename, PATHINFO_FILENAME);

        // Direct matching patterns
        $patterns = [
            '/Eco Watt/i' => 'FEW-ECOWATT',
            '/F-100 Liter/i' => 'FFEG-F100',
            '/F-140 Liter/i' => 'FFEG-F140',
            '/F-200 Liter/i' => 'FFEG-F200',
            '/F-30 Liter/i' => 'FFEW-F30',
            '/Fischer Fast Electric Water Heater$/i' => 'FFEW-F30', // Default to F-30
            '/Hybrid.*100 Gallon Heavy/i' => 'FHG-100G-HD',
            '/Hybrid.*25 Gallon/i' => 'FHG-25G',
            '/Hybrid.*35 Gallon/i' => 'FHG-35G',
            '/Hybrid.*55 Gallon/i' => 'FHG-55G',
            '/Gas Geyser 35 Gallon/i' => 'FGG-35G',
            '/Gas Geyser 55 Gallon/i' => 'FGG-55G',
            '/Instant Cum Storage.*10 Litr/i' => 'FICS-10L',
            '/Instant Cum Storage.*15 Litr/i' => 'FICS-15L',
            '/Instant Cum Storage.*30 Litr/i' => 'FICS-30L',
            '/Instant Electric.*Storage 20/i' => 'FIEWHS-20L',
            '/Instant Electric.*Storage 25/i' => 'FIEWHS-25L',
            '/Instant Gas Water Heater/i' => 'FIGWH-6L', // Default to 6L
        ];

        foreach ($patterns as $pattern => $sku) {
            if (preg_match($pattern, $name)) {
                return Product::where('sku', $sku)->first();
            }
        }

        return null;
    }

    private function processWaterDispensers(string $categoryPath): void
    {
        // Water dispenser images are numbered (1.jpg, 2.jpg, etc.)
        // Match to products in category 9 (water-dispensers) by order
        $products = Product::whereHas('category', function ($query) {
            $query->where('slug', 'water-dispensers');
        })->orderBy('id')->get();

        if ($products->isEmpty()) {
            $this->warn("  No water dispenser products found in database");
            return;
        }

        $imageFiles = [];
        $files = scandir($categoryPath);
        foreach ($files as $file) {
            if (preg_match('/^(\d+)\.(jpg|jpeg|png|webp)$/i', $file, $matches)) {
                $imageFiles[(int)$matches[1]] = $categoryPath . DIRECTORY_SEPARATOR . $file;
            }
        }

        ksort($imageFiles);

        $productIndex = 0;
        foreach ($imageFiles as $index => $filePath) {
            if ($productIndex >= $products->count()) {
                $this->warn("  More images than products for water dispensers");
                break;
            }

            $product = $products[$productIndex];
            $this->importSingleImage($product, $filePath, true);
            $productIndex++;
        }
    }

    private function processProductFolder(string $modelNumber, string $productPath): void
    {
        // Find product by model number
        $product = Product::where('model_number', $modelNumber)
            ->orWhere('model_number', 'LIKE', '%' . $modelNumber . '%')
            ->first();

        if (!$product) {
            // Try with normalized model number
            $normalized = $this->normalizeModelNumber($modelNumber);
            $product = Product::where('model_number', $normalized)
                ->orWhere('model_number', 'LIKE', '%' . $normalized . '%')
                ->first();
        }

        if (!$product) {
            $this->notFound[] = "Model: {$modelNumber}";
            $this->skipped++;
            return;
        }

        // Get all image files in the product folder
        $imageFiles = [];
        $files = scandir($productPath);
        $imageIndex = 1;
        foreach ($files as $file) {
            if (preg_match('/^(\d+)\.(jpg|jpeg|png|webp)$/i', $file, $matches)) {
                $imageFiles[(int)$matches[1]] = $productPath . DIRECTORY_SEPARATOR . $file;
            } elseif (preg_match('/\.(jpg|jpeg|png|webp)$/i', $file)) {
                // Non-numbered images (e.g. named files) — assign sequential index
                while (isset($imageFiles[$imageIndex])) $imageIndex++;
                $imageFiles[$imageIndex] = $productPath . DIRECTORY_SEPARATOR . $file;
                $imageIndex++;
            }
        }

        if (empty($imageFiles)) {
            $this->line("  No images found for: {$modelNumber}");
            return;
        }

        ksort($imageFiles);

        // Delete existing images for this product
        $this->deleteExistingImages($product);

        // Import new images
        $sortOrder = 1;
        foreach ($imageFiles as $index => $filePath) {
            $isPrimary = ($sortOrder === 1);
            $this->importImage($product, $filePath, $isPrimary, $sortOrder);
            $sortOrder++;
        }

        $this->imported++;
        $this->line("  ✓ {$product->name} ({$product->model_number}) - " . count($imageFiles) . " images");
    }

    private function importSingleImage(Product $product, string $filePath, bool $deleteExisting = true): void
    {
        if ($deleteExisting) {
            $this->deleteExistingImages($product);
        }

        $this->importImage($product, $filePath, true, 1);
        $this->imported++;
        $this->line("  ✓ {$product->name} - 1 image");
    }

    private function deleteExistingImages(Product $product): void
    {
        $existingImages = $product->images;

        foreach ($existingImages as $image) {
            // Delete file from storage
            $imagePath = str_replace('/storage/', '', $image->image);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            if ($image->thumbnail) {
                $thumbPath = str_replace('/storage/', '', $image->thumbnail);
                if (Storage::disk('public')->exists($thumbPath)) {
                    Storage::disk('public')->delete($thumbPath);
                }
            }

            // Delete database record
            $image->delete();
        }
    }

    private function importImage(Product $product, string $sourcePath, bool $isPrimary, int $sortOrder): void
    {
        // Create product directory
        $productDir = 'products/' . $product->slug;
        Storage::disk('public')->makeDirectory($productDir);

        // Generate filename
        $filename = $sortOrder . '.webp';
        $thumbnailFilename = $sortOrder . '-thumb.webp';

        // Convert to WebP and save
        $image = $this->imageManager->read($sourcePath);

        // Save main image (max 1200px width)
        $image->scaleDown(width: 1200);
        $webpContent = $image->toWebp(quality: 85);
        Storage::disk('public')->put($productDir . '/' . $filename, $webpContent);

        // Save thumbnail (max 400px width)
        $image->scaleDown(width: 400);
        $thumbContent = $image->toWebp(quality: 80);
        Storage::disk('public')->put($productDir . '/' . $thumbnailFilename, $thumbContent);

        // Create database record
        ProductImage::create([
            'product_id' => $product->id,
            'image' => '/storage/' . $productDir . '/' . $filename,
            'thumbnail' => '/storage/' . $productDir . '/' . $thumbnailFilename,
            'alt_text' => $product->name,
            'sort_order' => $sortOrder,
            'is_primary' => $isPrimary,
        ]);

        // Free memory
        unset($image, $webpContent, $thumbContent);
        gc_collect_cycles();
    }

    private function normalizeModelNumber(string $modelNumber): string
    {
        // Apply known normalizations
        if (isset($this->modelNormalizations[$modelNumber])) {
            return $this->modelNormalizations[$modelNumber];
        }

        return $modelNumber;
    }
}
