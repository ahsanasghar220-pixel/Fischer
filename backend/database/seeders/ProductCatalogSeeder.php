<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

/**
 * Product Catalog Seeder - Uses images from product-catalog
 *
 * This seeder adds products with multiple images from the organized
 * product-catalog folder structure.
 */
class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $brand = Brand::where('slug', 'fischer')->first();

        if (!$brand) {
            $this->command->error('Fischer brand not found! Please run BrandSeeder first.');
            return;
        }

        // Seed catalog products
        $this->seedCatalogAirFryers($brand);
        $this->seedCatalogKitchenHobs($brand);
        $this->seedCatalogKitchenHoods($brand);
        $this->seedCatalogOvenToasters($brand);
    }

    private function seedCatalogAirFryers(Brand $brand): void
    {
        $category = Category::where('slug', 'air-fryers')->first();

        $products = [
            [
                'name' => 'Air Fryer FAF-401WD',
                'sku' => 'FAF-401WD',
                'model_number' => 'FAF-401WD',
                'price' => 16250,
                'short_description' => '4L Capacity, Digital Touch Panel, 8 Cooking Programs',
                'description' => 'Compact 4L digital air fryer with touch panel control. 8 cooking programs for versatile healthy cooking. Oil-free frying technology.',
                'specifications' => [
                    'Model' => 'FAF-401WD',
                    'Capacity' => '4L',
                    'Control' => 'Digital Touch Panel',
                    'Programs' => '8 Cooking Programs',
                    'Technology' => 'Oil-free Frying',
                ],
                'images' => [
                    '/images/product-catalog/air-fryers/FAF-401WD/1.webp',
                    '/images/product-catalog/air-fryers/FAF-401WD/2.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Air Fryer FAF-601WD',
                'sku' => 'FAF-601WD',
                'model_number' => 'FAF-601WD',
                'price' => 21875,
                'short_description' => '6L Capacity, Digital Touch Panel, 8 Cooking Programs',
                'description' => 'Medium 6L digital air fryer with touch panel control. 8 cooking programs for family-sized healthy meals. Oil-free frying technology.',
                'specifications' => [
                    'Model' => 'FAF-601WD',
                    'Capacity' => '6L',
                    'Control' => 'Digital Touch Panel',
                    'Programs' => '8 Cooking Programs',
                    'Technology' => 'Oil-free Frying',
                ],
                'images' => [
                    '/images/product-catalog/air-fryers/FAF-601WD/1.webp',
                    '/images/product-catalog/air-fryers/FAF-601WD/2.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_new' => true,
            ],
            [
                'name' => 'Air Fryer FAF-801WD',
                'sku' => 'FAF-801WD',
                'model_number' => 'FAF-801WD',
                'price' => 27500,
                'short_description' => '8L Capacity, Digital Touch Panel, 8 Cooking Programs',
                'description' => 'Large 8L digital air fryer with touch panel control. 8 cooking programs for large family meals. Premium oil-free frying technology.',
                'specifications' => [
                    'Model' => 'FAF-801WD',
                    'Capacity' => '8L',
                    'Control' => 'Digital Touch Panel',
                    'Programs' => '8 Cooking Programs',
                    'Technology' => 'Oil-free Frying',
                ],
                'images' => [
                    '/images/product-catalog/air-fryers/FAF-801WD/1.webp',
                    '/images/product-catalog/air-fryers/FAF-801WD/2.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProductsWithImages($products, $category, $brand);
    }

    private function seedCatalogKitchenHobs(Brand $brand): void
    {
        $category = Category::where('slug', 'built-in-hobs')->first();

        $products = [
            [
                'name' => 'Kitchen Hob FBH-G78-3CB',
                'sku' => 'FBH-G78-3CB',
                'model_number' => 'FBH-G78-3CB',
                'price' => 40625,
                'short_description' => '780mm Tempered Glass, Cast Iron Pan Support, Battery Pulse Ignition, 2000 Pa NG',
                'description' => '780mm Tempered glass panel with cast iron pan support. Battery pulse ignition. Gas Type: 2000 Pa (NG).',
                'specifications' => [
                    'Model' => 'FBH-G78-3CB',
                    'Panel' => '780mm Tempered Glass',
                    'Pan Support' => 'Cast Iron',
                    'Ignition' => 'Battery Pulse',
                    'Gas Type' => '2000 Pa (NG)',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/1.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/2.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-G78-3CB/3.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-G78-3CB (MATTE)',
                'sku' => 'FBH-G78-3CB-MATTE',
                'model_number' => 'FBH-G78-3CB (MATTE)',
                'price' => 40000,
                'short_description' => '8mm Matte Glass Panel, Metal Pan Support, Zinc Alloy Knobs, 3-in-1 Aluminum Burner',
                'description' => '8mm tempered glass matte panel. Metal pan support with zinc alloy knobs. 3-in-1 aluminum burner design.',
                'specifications' => [
                    'Model' => 'FBH-G78-3CB (MATTE)',
                    'Panel' => '8mm Tempered Glass Matte',
                    'Pan Support' => 'Metal',
                    'Burner' => '3-in-1 Aluminum',
                    'Knobs' => 'Zinc Alloy',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-G78-3CB(MATT)/1.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-G90-5SBF',
                'sku' => 'FBH-G90-5SBF',
                'model_number' => 'FBH-G90-5SBF',
                'price' => 43125,
                'short_description' => '8mm Tempered Glass, 5 Burner, Cast Iron Support, SABAF Burner, Dual Gas',
                'description' => '8mm tempered glass panel with 5-burner configuration. Cast iron pan support with premium SABAF burner. Dual gas compatibility.',
                'specifications' => [
                    'Model' => 'FBH-G90-5SBF',
                    'Panel' => '8mm Tempered Glass',
                    'Pan Support' => 'Cast Iron',
                    'Burner' => 'SABAF',
                    'Burner Count' => '5',
                    'Features' => 'Dual Gas Compatibility',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/1.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/2.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-G90-5SBF/3.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-SS76-3CB',
                'sku' => 'FBH-SS76-3CB',
                'model_number' => 'FBH-SS76-3CB',
                'price' => 39000,
                'short_description' => '0.8mm Stainless Steel Panel, Heavy Cast Iron, Brass Burners',
                'description' => '0.8mm Stainless Steel Brushed Panel. Heavy Cast iron pan support with brass burners.',
                'specifications' => [
                    'Model' => 'FBH-SS76-3CB',
                    'Panel' => '0.8mm Stainless Steel Brushed',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Brass',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-SS76-3CB/1.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-SS76-3EPS',
                'sku' => 'FBH-SS76-3EPS',
                'model_number' => 'FBH-SS76-3EPS',
                'price' => 38125,
                'short_description' => '0.8mm Stainless Steel Panel, EPS Burner, Battery Ignition, 2000 Pa NG',
                'description' => '0.8mm Stainless Steel Brushed Panel. EPS burner with battery pulse ignition. Gas Type: 2000 Pa (NG).',
                'specifications' => [
                    'Model' => 'FBH-SS76-3EPS',
                    'Panel' => '0.8mm Stainless Steel',
                    'Burner' => 'EPS',
                    'Ignition' => 'Battery Pulse',
                    'Gas Type' => '2000 Pa (NG)',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/1.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/2.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-SS76-3EPS/3.webp',
                ],
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-SS84-3SBF',
                'sku' => 'FBH-SS84-3SBF',
                'model_number' => 'FBH-SS84-3SBF',
                'price' => 38125,
                'short_description' => '201 Stainless Steel, SABAF Burner, Dual Gas Compatibility',
                'description' => '201 stainless steel panel with SABAF burner. Dual gas compatibility for versatile use.',
                'specifications' => [
                    'Model' => 'FBH-SS84-3SBF',
                    'Panel' => '201 Stainless Steel',
                    'Burner' => 'SABAF',
                    'Features' => 'Dual Gas Compatibility',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-SS84-3SBF/1.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-SS84-3SBF/2.webp',
                ],
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-SS86-3CB',
                'sku' => 'FBH-SS86-3CB',
                'model_number' => 'FBH-SS86-3CB',
                'price' => 46250,
                'short_description' => '1.2mm Stainless Steel Panel, Brass Burners, Heavy Iron Support',
                'description' => '1.2mm stainless steel panel with brass burners. Heavy iron pan support for stability.',
                'specifications' => [
                    'Model' => 'FBH-SS86-3CB',
                    'Panel' => '1.2mm Stainless Steel',
                    'Burner' => 'Brass',
                    'Pan Support' => 'Heavy Iron',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/1.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/2.webp',
                    '/images/product-catalog/kitchen-hobs/FBH-SS86-3CB/3.webp',
                ],
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-SS90-5SBF',
                'sku' => 'FBH-SS90-5SBF',
                'model_number' => 'FBH-SS90-5SBF',
                'price' => 44375,
                'short_description' => '0.7mm Stainless Steel, 5 Chinese SABAF Burners, Dual Gas Compatibility',
                'description' => '0.7mm Stainless Steel surface panel with 5 Chinese SABAF burners. Dual gas compatibility.',
                'specifications' => [
                    'Model' => 'FBH-SS90-5SBF',
                    'Panel' => '0.7mm Stainless Steel',
                    'Burner' => 'Chinese SABAF',
                    'Burner Count' => '5',
                    'Features' => 'Dual Gas Compatibility',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hobs/FBH-SS90-5SBF/1.webp',
                ],
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProductsWithImages($products, $category, $brand);
    }

    private function seedCatalogKitchenHoods(Brand $brand): void
    {
        $category = Category::where('slug', 'built-in-hoods')->first();

        $products = [
            [
                'name' => 'Kitchen Hood FKH-H90-06S',
                'sku' => 'FKH-H90-06S',
                'model_number' => 'FKH-H90-06S',
                'price' => 48825,
                'short_description' => '900mm Black Chimney, 1000 m³/h Airflow, Heat Auto Clean, Gesture Control',
                'description' => '900mm Black Powder Coating Chimney + Panel. High airflow 1000 m³/h with 270W Metal Blower motor. 3 Speed Gesture with Touch Control and Heat Auto Clean technology.',
                'specifications' => [
                    'Model' => 'FKH-H90-06S',
                    'Width' => '900mm',
                    'Finish' => 'Black Powder Coating',
                    'Airflow' => '1000 m³/h',
                    'Motor' => '270W Metal Blower',
                    'Control' => '3 Speed Gesture + Touch',
                    'Features' => 'Heat Auto Clean',
                    'Lighting' => 'LED Lamp',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-H90-06S/1.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-L90-01IN',
                'sku' => 'FKH-L90-01IN',
                'model_number' => 'FKH-L90-01IN',
                'price' => 62500,
                'short_description' => '1500 m³/h Airflow, BLDC Copper Motor, Zero Vibration, 52 dB Low Noise',
                'description' => 'Premium flagship hood with highest 1500 m³/h airflow. 3 Speed + Boost with Heat Auto Clean. BLDC Copper Motor with low noise (52 dB) and zero vibration. Double LED Lamps.',
                'specifications' => [
                    'Model' => 'FKH-L90-01IN',
                    'Airflow' => '1500 m³/h',
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean',
                    'Noise' => '52 dB',
                    'Lighting' => 'Dual LED Lamps',
                    'Special' => 'Zero Vibration',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-L90-01IN/1.webp',
                    '/images/product-catalog/kitchen-hoods/FKH-L90-01IN/2.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-S90-021N',
                'sku' => 'FKH-S90-02IN',
                'model_number' => 'FKH-S90-02IN',
                'price' => 57500,
                'short_description' => 'Slant Hood, 1200 m³/h Airflow, BLDC Motor, Filterless, Tempered Glass',
                'description' => 'Elegant Slant Hood design with 1200 m³/h airflow. BLDC motor with filterless operation and tempered glass panel.',
                'specifications' => [
                    'Model' => 'FKH-S90-02IN',
                    'Style' => 'Slant Hood',
                    'Airflow' => '1200 m³/h',
                    'Motor' => 'BLDC',
                    'Features' => 'Filterless, Tempered Glass',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-S90-021N/1.webp',
                    '/images/product-catalog/kitchen-hoods/FKH-S90-021N/2.webp',
                ],
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-031N',
                'sku' => 'FKH-T90-03IN',
                'model_number' => 'FKH-T90-03IN',
                'price' => 49375,
                'short_description' => '3-Speed + Boost, Baffle Filters, Galvanized Sheet, Heavy Gauge Oil Cup',
                'description' => 'Premium hood with 3 Speed + Boost. Baffle filters with galvanized sheet construction. Heavy gauge oil cup for easy maintenance.',
                'specifications' => [
                    'Model' => 'FKH-T90-03IN',
                    'Control' => '3 Speed + Boost',
                    'Filters' => 'Baffle Filters',
                    'Construction' => 'Galvanized Sheet',
                    'Features' => 'Heavy Gauge Oil Cup',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-T90-031N/1.webp',
                    '/images/product-catalog/kitchen-hoods/FKH-T90-031N/2.webp',
                ],
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-04SC',
                'sku' => 'FKH-T90-04SC',
                'model_number' => 'FKH-T90-04SC',
                'price' => 59500,
                'short_description' => '3-Speed + Boost, 1680 m³/h Airflow, Gesture Control, 52 dB Noise Level',
                'description' => 'High performance hood with 1680 m³/h airflow. 3-speed with boost, gesture control, LED lamp, and low 52 dB noise level.',
                'specifications' => [
                    'Model' => 'FKH-T90-04SC',
                    'Airflow' => '1680 m³/h',
                    'Control' => '3 Speed + Boost, Gesture',
                    'Noise' => '52 dB',
                    'Lighting' => 'LED Lamp',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-T90-04SC/1.webp',
                ],
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-05S',
                'sku' => 'FKH-T90-05S',
                'model_number' => 'FKH-T90-05S',
                'price' => 44500,
                'short_description' => '900mm T-Shape, 1000 m³/h Airflow, Touch/Gesture Control, Auto-Heating Clean',
                'description' => '900mm T-shape chimney hood with 1000 m³/h airflow. Features touch and gesture control with auto-heating clean technology.',
                'specifications' => [
                    'Model' => 'FKH-T90-05S',
                    'Width' => '900mm',
                    'Style' => 'T-Shape',
                    'Airflow' => '1000 m³/h',
                    'Control' => 'Touch/Gesture',
                    'Features' => 'Auto-Heating Clean',
                ],
                'images' => [
                    '/images/product-catalog/kitchen-hoods/FKH-T90-05S/2.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
        ];

        $this->createProductsWithImages($products, $category, $brand);
    }

    private function seedCatalogOvenToasters(Brand $brand): void
    {
        $category = Category::where('slug', 'oven-toasters')->first();

        $products = [
            [
                'name' => 'Oven Toaster FOT-1901D',
                'sku' => 'FOT-1901D',
                'model_number' => 'FOT-1901D',
                'price' => 28750,
                'short_description' => '35L Digital Display, 1500W, 11-in-1 Functions, 120min Timer',
                'description' => 'Digital display oven toaster with 35L capacity and 11-in-1 functions. 1500W power with 120-minute timer. Modern touch controls.',
                'specifications' => [
                    'Model' => 'FOT-1901D',
                    'Capacity' => '35L',
                    'Power' => '1500W',
                    'Display' => 'Digital',
                    'Functions' => '11-in-1',
                    'Timer' => '120 minutes',
                ],
                'images' => [
                    '/images/product-catalog/oven-toasters/FOT-1901D/1.webp',
                    '/images/product-catalog/oven-toasters/FOT-1901D/2.webp',
                    '/images/product-catalog/oven-toasters/FOT-1901D/3.webp',
                    '/images/product-catalog/oven-toasters/FOT-1901D/4.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Oven Toaster FOT-2501C',
                'sku' => 'FOT-2501C',
                'model_number' => 'FOT-2501C',
                'price' => 31875,
                'short_description' => '48L Mechanical Control, 1800W, Convection Function, 60min Timer',
                'description' => 'Large capacity 48L oven toaster with mechanical control. 1800W power with convection function and 60-minute timer.',
                'specifications' => [
                    'Model' => 'FOT-2501C',
                    'Capacity' => '48L',
                    'Power' => '1800W',
                    'Control' => 'Mechanical',
                    'Function' => 'Convection',
                    'Timer' => '60 minutes',
                ],
                'images' => [
                    '/images/product-catalog/oven-toasters/FOT-2501C/1.webp',
                    '/images/product-catalog/oven-toasters/FOT-2501C/2.webp',
                    '/images/product-catalog/oven-toasters/FOT-2501C/3.webp',
                    '/images/product-catalog/oven-toasters/FOT-2501C/4.webp',
                ],
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
        ];

        $this->createProductsWithImages($products, $category, $brand);
    }

    private function createProductsWithImages(array $products, ?Category $category, ?Brand $brand): void
    {
        if (!$category || !$brand) {
            return;
        }

        foreach ($products as $productData) {
            $images = $productData['images'] ?? [];
            unset($productData['images']);

            $sku = $productData['sku'];
            unset($productData['sku']);

            // Check if product already exists
            $product = Product::where('sku', $sku)->first();

            if (!$product) {
                // Create new product
                $product = Product::create(array_merge($productData, [
                    'sku' => $sku,
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'is_active' => true,
                    'track_inventory' => true,
                    'stock_quantity' => ($productData['stock_status'] ?? 'in_stock') === 'in_stock' ? 100 : 0,
                    'low_stock_threshold' => 10,
                    'warranty_period' => '1 Year',
                ]));

                $this->command->info("✓ Created product: {$product->name}");
            } else {
                $this->command->info("⊗ Product already exists: {$product->name}");
            }

            // Add/Update images
            if (!empty($images)) {
                // Delete old images for this product
                ProductImage::where('product_id', $product->id)->delete();

                // Add new images
                foreach ($images as $index => $imagePath) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $imagePath,
                        'alt_text' => $product->name . ($index > 0 ? " - Image " . ($index + 1) : ''),
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }

                $this->command->info("  → Added " . count($images) . " images");
            }
        }
    }
}
