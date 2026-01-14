<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $brand = Brand::where('slug', 'fischer')->first();

        // First, clear existing products to avoid duplicates
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \Illuminate\Support\Facades\DB::table('product_images')->truncate();
        \Illuminate\Support\Facades\DB::table('products')->truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Only seed products that have valid local images
        // Electric Water Coolers (8 products with valid images)
        $this->seedWaterCoolers($brand);

        // Cooking Ranges (4 products with valid images)
        $this->seedCookingRanges($brand);

        // Note: Geyser images are corrupted, so not seeding those products
    }

    private function seedKitchenHoods(Brand $brand): void
    {
        $category = Category::where('slug', 'kitchen-hoods')->first();

        $products = [
            [
                'name' => 'Kitchen Hood FKH-T90-05S',
                'sku' => 'FKH-T90-05S',
                'model_number' => 'FKH-T90-05S',
                'price' => 33000,
                'short_description' => '900mm Black Powder Coating, 700 m³/h Airflow, 3 Speed Button Control',
                'description' => '900mm Black Powder Coating Chimney with AC motor (170W). Push button control with 3 speed options. Oil cup and 2 aluminum filters (0.5mm). LED lighting 2 × 2W.',
                'specifications' => [
                    'Model' => 'FKH-T90-05S',
                    'Width' => '900mm',
                    'Finish' => 'Black Powder Coating',
                    'Airflow' => '700 m³/h',
                    'Motor' => 'AC 170W',
                    'Control' => '3 Speed Button',
                    'Filters' => '2 Aluminum (0.5mm)',
                    'Lighting' => 'LED 2 × 2W',
                    'Features' => 'Oil Cup',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/FKH-T90-05S.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
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
                    'Lighting' => 'LED 1 × 2W',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-3-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-031N',
                'sku' => 'FKH-T90-031N',
                'model_number' => 'FKH-T90-031N',
                'price' => 49375,
                'short_description' => 'BLDC Copper Motor, 3 Speed + Boost, Heat Auto Clean, 3 Baffle Filters',
                'description' => 'Premium hood with 3 Speed + Boost and Heat Auto Clean. Gesture and Touch Control. BLDC Copper Motor for low noise and high efficiency. 3 baffle filters (0.7mm) with 500mm chimney height.',
                'specifications' => [
                    'Model' => 'FKH-T90-031N',
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean',
                    'Filters' => '3 Baffle Filters (0.7mm)',
                    'Chimney Height' => '500mm',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-S90-021N',
                'sku' => 'FKH-S90-021N',
                'model_number' => 'FKH-S90-021N',
                'price' => 57500,
                'short_description' => 'Slant Hood, 1200 m³/h Airflow, BLDC Copper Motor, Filterless Operation',
                'description' => 'Elegant Slant Hood design with 3 Speed + Boost. Heat Auto Clean with Gesture and Touch Control. BLDC Copper Motor with filterless operation for easy maintenance. 0.6/0.7mm thickness.',
                'specifications' => [
                    'Model' => 'FKH-S90-021N',
                    'Style' => 'Slant Hood',
                    'Airflow' => '1200 m³/h',
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean, Filterless',
                    'Thickness' => '0.6/0.7mm',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-1-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-04SC',
                'sku' => 'FKH-T90-04SC',
                'model_number' => 'FKH-T90-04SC',
                'price' => 37500,
                'short_description' => '900mm, AC Motor 210W, Touch Control, 2 Aluminum Filters',
                'description' => '900mm hood with AC Motor (210W). Features touch panel control and oil cup. 2 Aluminum filters (0.5mm) with LED lighting (1 × 2W).',
                'specifications' => [
                    'Model' => 'FKH-T90-04SC',
                    'Width' => '900mm',
                    'Motor' => 'AC 210W',
                    'Control' => 'Touch Panel',
                    'Filters' => '2 Aluminum (0.5mm)',
                    'Features' => 'Oil Cup',
                    'Lighting' => 'LED 1 × 2W',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/FKH-T90-04SC.png',
                'stock_status' => 'in_stock',
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
                    'Lighting' => 'Double LED Lamps',
                    'Special' => 'Zero Vibration',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-5-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedKitchenHobs(Brand $brand): void
    {
        $category = Category::where('slug', 'kitchen-hobs')->first();

        $products = [
            [
                'name' => 'Kitchen Hob FBH-SS76-3EPS',
                'sku' => 'FBH-SS76-3EPS',
                'model_number' => 'FBH-SS76-3EPS',
                'price' => 31000,
                'short_description' => '0.7mm Stainless Steel Panel, Enamel Pan Support, Italian EPS Burner',
                'description' => '0.7mm Stainless Steel Brushed Panel. Enamel pan support with metal knobs. Features Italian EPS (Electronic Pulse Start) burner with 1.5V battery pulse ignition.',
                'specifications' => [
                    'Model' => 'FBH-SS76-3EPS',
                    'Panel' => '0.7mm Stainless Steel Brushed',
                    'Pan Support' => 'Enamel',
                    'Burner' => 'Italian EPS',
                    'Knobs' => 'Metal',
                    'Ignition' => '1.5V Battery Pulse',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS76-3EPS.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-SS84-3SBF',
                'sku' => 'FBH-SS84-3SBF',
                'model_number' => 'FBH-SS84-3SBF',
                'price' => 38750,
                'short_description' => '0.7mm Stainless Steel Panel, Cast Iron Pan Support, Chinese SABAF Burner',
                'description' => '0.7mm Stainless Steel Brushed Panel. Heavy duty cast iron pan support with metal knobs. Chinese SABAF burner with 1.5V battery pulse ignition. 2800Pa gas type.',
                'specifications' => [
                    'Model' => 'FBH-SS84-3SBF',
                    'Panel' => '0.7mm Stainless Steel Brushed',
                    'Pan Support' => 'Cast Iron',
                    'Burner' => 'Chinese SABAF',
                    'Knobs' => 'Metal',
                    'Ignition' => '1.5V Battery Pulse',
                    'Gas Type' => '2800Pa',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS84-3SBF.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-SS76-3CB',
                'sku' => 'FBH-SS76-3CB',
                'model_number' => 'FBH-SS76-3CB',
                'price' => 39000,
                'short_description' => '0.8mm Stainless Steel Panel, Heavy Cast Iron, Brass Burner Caps, Flame Failure Safety',
                'description' => '0.8mm Stainless Steel Brushed Panel. Heavy Cast iron pan support with brass burner caps. Metal knobs with flame failure safety device for added protection.',
                'specifications' => [
                    'Model' => 'FBH-SS76-3CB',
                    'Panel' => '0.8mm Stainless Steel Brushed',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Brass Caps',
                    'Knobs' => 'Metal',
                    'Safety' => 'Flame Failure Device',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS76-3CB-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-G78-3CB',
                'sku' => 'FBH-G78-3CB',
                'model_number' => 'FBH-G78-3CB',
                'price' => 40625,
                'short_description' => '780mm Tempered Glass, Cast Iron Pan Support, Brass Burner, 2000 Pa NG',
                'description' => '780mm Tempered glass surface panel with modern design. Cast iron pan support with corner/Metal knobs and brass burner. 1.5V battery pulse ignition. Gas Type: 2000 Pa (NG).',
                'specifications' => [
                    'Model' => 'FBH-G78-3CB',
                    'Panel' => '780mm Tempered Glass',
                    'Pan Support' => 'Cast Iron',
                    'Burner' => 'Brass',
                    'Knobs' => 'Metal',
                    'Ignition' => '1.5V Battery Pulse',
                    'Gas Type' => '2000 Pa (NG)',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-G78-3CB-800x800.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-G78-3CB (MATTE)',
                'sku' => 'FBH-G78-3CB-MATTE',
                'model_number' => 'FBH-G78-3CB (MATTE)',
                'price' => 40000,
                'short_description' => '8mm Tempered Glass Matte Finish, 3-in-1 Aluminium Burner, Flame Failure Safety',
                'description' => '8mm Tempered Glass Panel with Fine Matte Finish. Metal Steel Matt Enamel Pan Support. 3-in-1 Aluminium Burner Base with Brass Burner Caps. Zinc Alloy Knobs with Flame Failure Safety Device.',
                'specifications' => [
                    'Model' => 'FBH-G78-3CB (MATTE)',
                    'Panel' => '8mm Tempered Glass Matte',
                    'Pan Support' => 'Metal Steel Matt Enamel',
                    'Burner' => '3-in-1 Aluminium Base, Brass Caps',
                    'Knobs' => 'Zinc Alloy',
                    'Ignition' => '1.5V DC Battery Pulse',
                    'Safety' => 'Flame Failure Device',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-G78-3CB-3-800x800.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-G90-5SBF',
                'sku' => 'FBH-G90-5SBF',
                'model_number' => 'FBH-G90-5SBF',
                'price' => 43125,
                'short_description' => '8mm Tempered Glass, 5 Burner SABAF, Cast Iron Pan Support',
                'description' => '8mm tempered glass panel with spacious 5-burner configuration. Cast iron pan support with metal knobs. Premium SABAF burner system with 1.5V battery pulse ignition.',
                'specifications' => [
                    'Model' => 'FBH-G90-5SBF',
                    'Panel' => '8mm Tempered Glass',
                    'Pan Support' => 'Cast Iron',
                    'Burner' => 'SABAF',
                    'Burner Count' => '5',
                    'Knobs' => 'Metal',
                    'Ignition' => '1.5V Battery Pulse',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-G90-5SBF-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-SS90-5SBF',
                'sku' => 'FBH-SS90-5SBF',
                'model_number' => 'FBH-SS90-5SBF',
                'price' => 44375,
                'short_description' => '0.7mm Stainless Steel, 5 Chinese SABAF Burners, Heavy Cast Iron',
                'description' => '0.7mm Stainless Steel Surface panel with professional grade design. Heavy Cast iron pan support with Chinese SABAF burner. 5 burner configuration for versatile cooking.',
                'specifications' => [
                    'Model' => 'FBH-SS90-5SBF',
                    'Panel' => '0.7mm Stainless Steel',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Chinese SABAF',
                    'Burner Count' => '5',
                    'Knobs' => 'Metal',
                    'Ignition' => '1.5V Battery Pulse',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS90-5SBF-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-G90-5CB',
                'sku' => 'FBH-G90-5CB',
                'model_number' => 'FBH-G90-5CB',
                'price' => 47500,
                'short_description' => '8mm Tempered Glass, 5 Brass Burner, Cast Iron, Flame Failure Safety',
                'description' => '8mm Tempered Glass Panel with 5-burner brass configuration. Heavy Cast iron pan support with metal knobs. Brass burner caps with Flame Failure Safety Device.',
                'specifications' => [
                    'Model' => 'FBH-G90-5CB',
                    'Panel' => '8mm Tempered Glass',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Brass Caps',
                    'Burner Count' => '5',
                    'Knobs' => 'Metal',
                    'Safety' => 'Flame Failure Device',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-G90-5CB.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedGasWaterHeaters(Brand $brand): void
    {
        $category = Category::where('slug', 'gas-water-heaters')->first();

        $products = [
            [
                'name' => 'Instant Gas Water Heater 15G',
                'sku' => 'FGWH-15G',
                'model_number' => '15G',
                'price' => 42500,
                'short_description' => '15 Gallon Instant Gas Geyser with Copper Heat Exchanger',
                'description' => '15 Gallon capacity instant gas water heater. Features copper heat exchanger for efficient heating. Suitable for small to medium households.',
                'specifications' => [
                    'Capacity' => '15 Gallon',
                    'Type' => 'Instant Gas',
                    'Heat Exchanger' => 'Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/gas-geyser-15g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Instant Gas Water Heater 25G',
                'sku' => 'FGWH-25G',
                'model_number' => '25G',
                'price' => 52500,
                'short_description' => '25 Gallon Instant Gas Geyser with Copper Heat Exchanger',
                'description' => '25 Gallon capacity instant gas water heater. Features copper heat exchanger for efficient and fast heating. Ideal for medium households.',
                'specifications' => [
                    'Capacity' => '25 Gallon',
                    'Type' => 'Instant Gas',
                    'Heat Exchanger' => 'Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/gas-geyser-25g.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Instant Gas Water Heater 35G',
                'sku' => 'FGWH-35G',
                'model_number' => '35G',
                'price' => 65000,
                'short_description' => '35 Gallon Instant Gas Geyser with Copper Heat Exchanger',
                'description' => '35 Gallon capacity instant gas water heater. Premium copper heat exchanger for consistent hot water supply. Suitable for large households.',
                'specifications' => [
                    'Capacity' => '35 Gallon',
                    'Type' => 'Instant Gas',
                    'Heat Exchanger' => 'Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/gas-geyser-35g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Instant Gas Water Heater 55G',
                'sku' => 'FGWH-55G',
                'model_number' => '55G',
                'price' => 85000,
                'short_description' => '55 Gallon Instant Gas Geyser with Copper Heat Exchanger',
                'description' => '55 Gallon capacity instant gas water heater. Largest instant gas model with premium copper heat exchanger. Ideal for large families and commercial use.',
                'specifications' => [
                    'Capacity' => '55 Gallon',
                    'Type' => 'Instant Gas',
                    'Heat Exchanger' => 'Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/gas-geyser-55g.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedHybridGeysers(Brand $brand): void
    {
        $category = Category::where('slug', 'hybrid-geysers')->first();

        $products = [
            [
                'name' => 'Hybrid Electric + Gas Geyser 15G',
                'sku' => 'FHG-15G',
                'model_number' => '15G',
                'price' => 38000,
                'compare_price' => 42000,
                'short_description' => '15 Gallon Dual-Fuel Hybrid Geyser (1500 Watt)',
                'description' => '15 Gallon hybrid geyser with both electric (1500W) and gas heating options. Dual-fuel flexibility for year-round hot water.',
                'specifications' => [
                    'Capacity' => '15 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Electric Power' => '1500 Watt',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/hybrid-geyser-15g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 25G',
                'sku' => 'FHG-25G',
                'model_number' => '25G',
                'price' => 53000,
                'compare_price' => 58000,
                'short_description' => '25 Gallon Dual-Fuel Hybrid Geyser (2000 Watt)',
                'description' => '25 Gallon hybrid geyser with both electric (2000W) and gas heating options. Popular choice for medium households.',
                'specifications' => [
                    'Capacity' => '25 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Electric Power' => '2000 Watt',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/25-gallon-hybrid-3-removebg-preview.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'average_rating' => 4.5,
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 35G',
                'sku' => 'FHG-35G',
                'model_number' => '35G',
                'price' => 62000,
                'compare_price' => 68000,
                'short_description' => '35 Gallon Dual-Fuel Hybrid Geyser (2000 Watt)',
                'description' => '35 Gallon hybrid geyser with both electric (2000W) and gas heating options. Larger capacity for bigger families.',
                'specifications' => [
                    'Capacity' => '35 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Electric Power' => '2000 Watt',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/hybrid-electric-gas-geyser-35-gallon-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 55G',
                'sku' => 'FHG-55G',
                'model_number' => '55G',
                'price' => 78000,
                'compare_price' => 85000,
                'short_description' => '55 Gallon Dual-Fuel Hybrid Geyser (3000 Watt)',
                'description' => '55 Gallon hybrid geyser with both electric (3000W) and gas heating options. High capacity for large families.',
                'specifications' => [
                    'Capacity' => '55 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Electric Power' => '3000 Watt',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/hybrid-electric-gas-geyser-55-gallon-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 70G',
                'sku' => 'FHG-70G',
                'model_number' => '70G',
                'price' => 95000,
                'short_description' => '70 Gallon Dual-Fuel Hybrid Geyser (3500 Watt)',
                'description' => '70 Gallon hybrid geyser with both electric (3500W) and gas heating options. Commercial grade capacity.',
                'specifications' => [
                    'Capacity' => '70 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Electric Power' => '3500 Watt',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/hybrid-electric-gas-geyser-70-gallon.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 100G Heavy Duty',
                'sku' => 'FHG-100G-HD',
                'model_number' => '100G Heavy Duty',
                'price' => 150000,
                'short_description' => '100 Gallon Heavy Duty Hybrid Geyser (2000W × 4 = 8000 Watt)',
                'description' => 'Industrial grade 100 Gallon hybrid geyser. Imported gas thermostat with auto ignition. Imported glass wool insulation. Italian electric element + thermostat. 9/10 inner tank with 2000W × 4 (8000W total) heating.',
                'specifications' => [
                    'Capacity' => '100 Gallon',
                    'Type' => 'Hybrid Heavy Duty',
                    'Electric Power' => '2000W × 4 (8000W)',
                    'Gas Thermostat' => 'Imported with Auto Ignition',
                    'Insulation' => 'Imported Glass Wool',
                    'Element' => 'Italian Electric + Thermostat',
                    'Inner Tank' => '9/10 Gauge',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/hybrid-electric-gas-geyser-100-gallon-800x800.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedFastElectricWaterHeaters(Brand $brand): void
    {
        $category = Category::where('slug', 'fast-electric-water-heaters')->first();

        $products = [
            [
                'name' => 'Storage Electric Geyser 30L',
                'sku' => 'FEW-F30',
                'model_number' => 'F-30',
                'price' => 23000,
                'short_description' => '30 Liter Storage Electric Geyser',
                'description' => 'Compact 30 liter storage electric geyser. Single welded tank with thermal safety cutouts. Fully insulated for efficient heating.',
                'specifications' => [
                    'Capacity' => '30 Liters',
                    'Type' => 'Storage Electric',
                    'Tank' => 'Single Welded',
                    'Safety' => 'Thermal Cutouts',
                ],
                'image' => '/images/products/geyser-storage-1.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Storage Electric Geyser 50L',
                'sku' => 'FEW-F50',
                'model_number' => 'F-50',
                'price' => 26500,
                'short_description' => '50 Liter Storage Electric Geyser',
                'description' => '50 liter storage electric geyser for average families. Reliable and efficient heating.',
                'specifications' => [
                    'Capacity' => '50 Liters',
                    'Type' => 'Storage Electric',
                    'Tank' => 'Single Welded',
                    'Safety' => 'Thermal Cutouts',
                ],
                'image' => '/images/products/geyser-storage-2.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedInstantElectricWaterHeaters(Brand $brand): void
    {
        $category = Category::where('slug', 'instant-electric-water-heaters')->first();

        $products = [
            // Instant Cum Storage Type
            [
                'name' => 'Instant Electric Water Heater 10L',
                'sku' => 'FE-10-ICS',
                'model_number' => 'FE-10 ICS',
                'price' => 18500,
                'short_description' => '10 Liter Instant Electric Water Heater',
                'description' => '10 liter instant water heater. Compact design for quick heating. Perfect for small bathrooms.',
                'specifications' => [
                    'Capacity' => '10 Liters',
                    'Type' => 'Instant Electric',
                    'Feature' => 'Quick Heating',
                ],
                'image' => '/images/products/geyser-instant-1.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Instant Electric Water Heater 15L',
                'sku' => 'FE-15-ICS',
                'model_number' => 'FE-15 ICS',
                'price' => 21000,
                'short_description' => '15 Liter Instant Electric Water Heater',
                'description' => '15 liter instant water heater. Perfect balance of instant heating and storage.',
                'specifications' => [
                    'Capacity' => '15 Liters',
                    'Type' => 'Instant Electric',
                    'Feature' => 'Quick Heating',
                ],
                'image' => '/images/products/geyser-instant-2.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedWaterCoolers(Brand $brand): void
    {
        $category = Category::where('slug', 'water-coolers')->first();

        $products = [
            [
                'name' => 'Electric Water Cooler FE 35 S.S',
                'sku' => 'FE-35-SS',
                'model_number' => 'FE 35 S.S',
                'price' => 57500,
                'short_description' => '35 Ltr/Hr Cooling, 2 Taps, Stainless Steel, Suitable for 35-70 People',
                'description' => 'Compact water cooler with 35 Ltr/Hr cooling capacity. Food-grade stainless steel construction with 100% pure copper coiling. CFC-free R134a refrigerant. Suitable for small offices (35-70 people).',
                'specifications' => [
                    'Cooling Capacity' => '35 Ltr/Hr',
                    'Suitable For' => '35-70 people',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-35ltr.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Electric Water Cooler FE 45 S.S',
                'sku' => 'FE-45-SS',
                'model_number' => 'FE 45 S.S',
                'price' => 62500,
                'short_description' => '45 Ltr/Hr Cooling, 2 Taps, Non-Corrosive Steel, Suitable for 45-90 People',
                'description' => 'Ideal for outdoor placement in schools and workshops. 45 Ltr/Hr cooling capacity with non-corrosive stainless steel construction. Serves 45-90 people.',
                'specifications' => [
                    'Cooling Capacity' => '45 Ltr/Hr',
                    'Suitable For' => '45-90 people',
                    'Taps' => '2',
                    'Material' => 'Non-corrosive Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-45ltr.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Electric Water Cooler FE 65 S.S',
                'sku' => 'FE-65-SS',
                'model_number' => 'FE 65 S.S',
                'price' => 67500,
                'short_description' => '65 Ltr/Hr Cooling, 2 Taps, Suitable for 65-130 People',
                'description' => 'High-capacity alternative to multiple low-capacity units. 65 Ltr/Hr cooling with reliable performance. Serves 65-130 people.',
                'specifications' => [
                    'Cooling Capacity' => '65 Ltr/Hr',
                    'Suitable For' => '65-130 people',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-65ltr.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Electric Water Cooler FE 80 S.S',
                'sku' => 'FE-80-SS',
                'model_number' => 'FE 80 S.S',
                'price' => 85000,
                'short_description' => '80 Ltr/Hr Cooling, 3 Taps, Suitable for 80-160 People',
                'description' => 'Suitable for educational institutions and workshops with moderate demand. 80 Ltr/Hr cooling with 3 taps for efficient dispensing. Serves 80-160 people.',
                'specifications' => [
                    'Cooling Capacity' => '80 Ltr/Hr',
                    'Suitable For' => '80-160 people',
                    'Taps' => '3',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-80ltr.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler FE 100 S.S',
                'sku' => 'FE-100-SS',
                'model_number' => 'FE 100 S.S',
                'price' => 112500,
                'short_description' => '100 Ltr/Hr Cooling, 4 Taps, Suitable for 100-200 People',
                'description' => 'Commercial-grade unit reducing costs by eliminating multiple cooler purchases. 100 Ltr/Hr cooling with 4 taps. Serves 100-200 people efficiently.',
                'specifications' => [
                    'Cooling Capacity' => '100 Ltr/Hr',
                    'Suitable For' => '100-200 people',
                    'Taps' => '4',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-100ltr.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
            [
                'name' => 'Electric Water Cooler FE 150 S.S',
                'sku' => 'FE-150-SS',
                'model_number' => 'FE 150 S.S',
                'price' => 140000,
                'short_description' => '150 Ltr/Hr Cooling, 4 Taps, Suitable for 150-300 People',
                'description' => 'Heavy-duty construction with 100% Pure Copper external coiling for contamination prevention. 150 Ltr/Hr cooling. Serves 150-300 people.',
                'specifications' => [
                    'Cooling Capacity' => '150 Ltr/Hr',
                    'Suitable For' => '150-300 people',
                    'Taps' => '4',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper External',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => '/images/products/water-cooler-150ltr.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler FE 200 S.S',
                'sku' => 'FE-200-SS',
                'model_number' => 'FE 200 S.S',
                'price' => 262500,
                'short_description' => '200 Ltr/Hr Cooling, 4 Taps, Suitable for 200-400 People',
                'description' => 'High-performance model with brand new compressors, condensers and fan motors. Dimensions: 63"H × 32"W × 27"D. Serves 200-400 people.',
                'specifications' => [
                    'Cooling Capacity' => '200 Ltr/Hr',
                    'Suitable For' => '200-400 people',
                    'Taps' => '4',
                    'Dimensions' => '63"H × 32"W × 27"D',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => '/images/products/water-cooler-fe200ss.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler FE 300 S.S',
                'sku' => 'FE-300-SS',
                'model_number' => 'FE 300 S.S',
                'price' => 300000,
                'short_description' => '300 Ltr/Hr Cooling, 4 Taps + Extra Point, Dual Compressor, 300-600 People',
                'description' => 'Large commercial capacity with dual compressor system. 4 taps plus extra point. Designed for high-demand facilities serving 300-600 people.',
                'specifications' => [
                    'Cooling Capacity' => '300 Ltr/Hr',
                    'Suitable For' => '300-600 people',
                    'Taps' => '4 + Extra Point',
                    'Compressors' => 'Dual',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => '/images/products/water-cooler-fe300ss.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedSlimWaterCoolers(Brand $brand): void
    {
        $category = Category::where('slug', 'slim-water-coolers')->first();

        $products = [
            [
                'name' => 'Slim Electric Water Cooler FE 35 Slim',
                'sku' => 'FE-35-SLIM',
                'model_number' => 'FE 35 Slim',
                'price' => 52000,
                'short_description' => '35 Ltr/Hr Slim Design, Space-Saving, 2 Taps',
                'description' => 'Space-saving slim design water cooler with 35 Ltr/Hr cooling capacity. Perfect for areas with limited floor space. 2 taps.',
                'specifications' => [
                    'Cooling Capacity' => '35 Ltr/Hr',
                    'Design' => 'Slim',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/slim-water-cooler-35.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Slim Electric Water Cooler FE 45 Slim',
                'sku' => 'FE-45-SLIM',
                'model_number' => 'FE 45 Slim',
                'price' => 58000,
                'short_description' => '45 Ltr/Hr Slim Design, Space-Saving, 2 Taps',
                'description' => 'Slim design water cooler with 45 Ltr/Hr cooling capacity. Compact footprint for efficient space usage. 2 taps.',
                'specifications' => [
                    'Cooling Capacity' => '45 Ltr/Hr',
                    'Design' => 'Slim',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/slim-water-cooler-45.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Slim Electric Water Cooler FE 65 Slim',
                'sku' => 'FE-65-SLIM',
                'model_number' => 'FE 65 Slim',
                'price' => 64000,
                'short_description' => '65 Ltr/Hr Slim Design, Space-Saving, 2 Taps',
                'description' => 'High-capacity slim water cooler with 65 Ltr/Hr cooling. Maximum cooling in minimal space. 2 taps.',
                'specifications' => [
                    'Cooling Capacity' => '65 Ltr/Hr',
                    'Design' => 'Slim',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/slim-water-cooler-65.png',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedWaterDispensers(Brand $brand): void
    {
        $category = Category::where('slug', 'water-dispensers')->first();

        $products = [
            [
                'name' => 'Bottle Type Water Dispenser',
                'sku' => 'FWD-BOTTLE',
                'model_number' => 'Bottle Type',
                'price' => 45000,
                'short_description' => 'Bottle Type Water Dispenser with Hot & Cold',
                'description' => 'Bottle type water dispenser with hot and cold water options. Perfect for home and small office use.',
                'specifications' => [
                    'Type' => 'Bottle Type',
                    'Features' => 'Hot & Cold Water',
                    'Material' => 'Food-grade Components',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/bottle-type-dispenser.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fountain Type Water Dispenser',
                'sku' => 'FWD-FOUNTAIN',
                'model_number' => 'Fountain Type',
                'price' => 70000,
                'short_description' => 'Fountain Type Water Dispenser, Direct Water Connection',
                'description' => 'Fountain type water dispenser with direct water connection. Food grade Non-Magnetic Stainless Steel Water Tank. Premium copper coiling.',
                'specifications' => [
                    'Type' => 'Fountain Type',
                    'Connection' => 'Direct Water',
                    'Tank' => 'Food-grade Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/fountain-type-water-dispenser-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Water Dispenser WD 1150',
                'sku' => 'FWD-1150',
                'model_number' => 'WD 1150',
                'price' => 38500,
                'short_description' => 'Compact Standing Water Dispenser for Home/Office',
                'description' => 'Quality water dispenser for home and small office use. ISO and PSQCA approved construction. Compact standing design.',
                'specifications' => [
                    'Model' => 'WD 1150',
                    'Type' => 'Standing Dispenser',
                    'Material' => 'Food-grade Components',
                    'Certifications' => 'ISO, PSQCA Approved',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-16-at-7.46.04-PM-800x800.jpeg',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedStorageCoolers(Brand $brand): void
    {
        $category = Category::where('slug', 'storage-type-water-coolers')->first();

        $products = [
            [
                'name' => 'Self-Contained Storage Water Cooler FST 25',
                'sku' => 'FST-25',
                'model_number' => 'FST 25',
                'price' => 103000,
                'short_description' => '25 Liters Storage, 64"H × 19.5"W × 19.5"D, 2 Taps',
                'description' => 'Food grade Non-Magnetic Stainless Steel Water Tank with 25L storage. Brand new compressor and copper fan motor. Fully copper coiling with CFC-free 134a refrigerant.',
                'specifications' => [
                    'Storage Capacity' => '25 Liters',
                    'Height' => '64"',
                    'Width' => '19.5"',
                    'Depth' => '19.5"',
                    'Taps' => '2',
                    'Material' => 'Food-grade Stainless Steel',
                    'Coiling' => 'Fully Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/water-cooler-storage-capacity-25-liters.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 50',
                'sku' => 'FST-50',
                'model_number' => 'FST 50',
                'price' => 145000,
                'short_description' => '50 Liters Storage, 64"H × 24"W × 24"D, 2 Taps',
                'description' => 'Stainless steel tank with new compressor and copper motor. 50L storage capacity. All-copper coils with environmentally safe gas.',
                'specifications' => [
                    'Storage Capacity' => '50 Liters',
                    'Height' => '64"',
                    'Width' => '24"',
                    'Depth' => '24"',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => 'All-Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FST-50-S.S-2.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 100',
                'sku' => 'FST-100',
                'model_number' => 'FST 100',
                'price' => 225000,
                'short_description' => '100 Liters Storage, 70"H × 28"W × 27"D, 3 Taps',
                'description' => 'Premium stainless steel construction with 100L storage. 3 taps for efficient dispensing. Identical premium component specifications.',
                'specifications' => [
                    'Storage Capacity' => '100 Liters',
                    'Height' => '70"',
                    'Width' => '28"',
                    'Depth' => '27"',
                    'Taps' => '3',
                    'Material' => 'Premium Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FST-100-S.S-2-.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 200',
                'sku' => 'FST-200',
                'model_number' => 'FST 200',
                'price' => 345000,
                'short_description' => '200 Liters Storage, 78"H × 36"W × 28"D, 4 Taps',
                'description' => 'Large-capacity stainless steel model with 200L storage. 4 taps for high-volume dispensing. Premium specifications.',
                'specifications' => [
                    'Storage Capacity' => '200 Liters',
                    'Height' => '78"',
                    'Width' => '36"',
                    'Depth' => '28"',
                    'Taps' => '4',
                    'Material' => 'Premium Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/water-cooler-storage-capacity-200-liters.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 400',
                'sku' => 'FST-400',
                'model_number' => 'FST 400',
                'price' => 485000,
                'short_description' => '400 Liters Storage, Commercial Grade, 4 Taps',
                'description' => 'Commercial grade 400L storage water cooler. Heavy-duty construction for high-demand environments.',
                'specifications' => [
                    'Storage Capacity' => '400 Liters',
                    'Taps' => '4',
                    'Material' => 'Commercial Grade Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/storage-cooler-400.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 600',
                'sku' => 'FST-600',
                'model_number' => 'FST 600',
                'price' => 650000,
                'short_description' => '600 Liters Storage, Industrial Grade, 4+ Taps',
                'description' => 'Industrial grade 600L storage water cooler. Designed for factories and large institutions.',
                'specifications' => [
                    'Storage Capacity' => '600 Liters',
                    'Taps' => '4+',
                    'Material' => 'Industrial Grade Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/storage-cooler-600.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Self-Contained Storage Water Cooler FST 1000',
                'sku' => 'FST-1000',
                'model_number' => 'FST 1000',
                'price' => 850000,
                'short_description' => '1000 Liters Storage, Industrial Maximum Capacity',
                'description' => 'Maximum capacity 1000L industrial storage water cooler. For the largest institutions and industrial facilities.',
                'specifications' => [
                    'Storage Capacity' => '1000 Liters',
                    'Taps' => '4+',
                    'Material' => 'Industrial Grade Stainless Steel',
                    'Type' => 'Maximum Capacity',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/storage-cooler-1000.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedOvenToasters(Brand $brand): void
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/35-L-800x800.jpg',
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/48-L-800x800.jpg',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedAirFryers(Brand $brand): void
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/air-fryer-4l.jpg',
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/air-fryer-6l.jpg',
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/air-fryer-8l.jpg',
                'stock_status' => 'in_stock',
                'is_new' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedCookingRanges(Brand $brand): void
    {
        $category = Category::where('slug', 'cooking-ranges')->first();

        $products = [
            [
                'name' => 'Cooking Cabinet 3 Burner',
                'sku' => 'FCC-3B',
                'model_number' => '3 Burner Cabinet',
                'price' => 28500,
                'short_description' => '3 Burner, 34", Double Door, Metal Top',
                'description' => 'Affordable 3 burner cooking cabinet with metal top. Double door storage and 34" width.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                ],
                'image' => '/images/products/cooking-cabinet-3-burner.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Cooking Cabinet 5 Burner',
                'sku' => 'FCC-5B',
                'model_number' => '5 Burner Cabinet',
                'price' => 29500,
                'short_description' => '5 Burner, 34", Double Door, Metal Top',
                'description' => '5 burner cooking cabinet with metal top. Double door storage and 34" width.',
                'specifications' => [
                    'Burners' => '5',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                ],
                'image' => '/images/products/cooking-cabinet-5-burner.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Cooking Range 3 Brass Burner',
                'sku' => 'FCR-3BB',
                'model_number' => '3 Brass Burner Range',
                'price' => 42000,
                'short_description' => '34", 3 Brass Burners, Stainless Steel Body, Auto Ignition',
                'description' => 'Premium cooking range with 3 brass burners. Stainless steel body with double door and auto ignition.',
                'specifications' => [
                    'Burners' => '3 Brass',
                    'Width' => '34"',
                    'Body' => 'Stainless Steel',
                    'Doors' => 'Double Door',
                    'Ignition' => 'Auto',
                ],
                'image' => '/images/products/cooking-range-3-brass.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Cooking Range 5 Brass Burner',
                'sku' => 'FCR-5BB',
                'model_number' => '5 Brass Burner Range',
                'price' => 43000,
                'short_description' => '34", 5 Brass Burners, Stainless Steel, Auto Ignition',
                'description' => 'Professional cooking range with 5 brass burners. Full stainless steel construction with auto ignition.',
                'specifications' => [
                    'Burners' => '5 Brass',
                    'Width' => '34"',
                    'Body' => 'Stainless Steel',
                    'Doors' => 'Double Door',
                    'Ignition' => 'Auto',
                ],
                'image' => '/images/products/cooking-range-5-brass.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedAccessories(Brand $brand): void
    {
        $category = Category::where('slug', 'accessories')->first();

        $products = [
            [
                'name' => 'Fischer Electric Iron',
                'sku' => 'FAC-IRN',
                'model_number' => 'Electric Iron',
                'price' => 4800,
                'short_description' => 'Quality Electric Iron, Multiple Colors Available',
                'description' => 'Reliable electric iron with quality heating element. Multiple color variants available.',
                'specifications' => [
                    'Type' => 'Electric Iron',
                    'Variants' => 'Multiple Colors',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/White-Golden-Iron-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer 2 in 1 Blender',
                'sku' => 'FAC-BL2',
                'model_number' => '2 in 1 Blender',
                'price' => 6960,
                'short_description' => '2-in-1 Blender for Blending and Grinding',
                'description' => 'Quality 2-in-1 blender from Fischer. Perfect for blending and grinding tasks.',
                'specifications' => [
                    'Type' => '2 in 1 Blender',
                    'Functions' => 'Blending, Grinding',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/Blender-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer 3 in 1 Blender Juicer',
                'sku' => 'FAC-BL3',
                'model_number' => '3 in 1 Blender',
                'price' => 13050,
                'short_description' => '3-in-1 Blender with Juicing Capability',
                'description' => 'Premium 3-in-1 blender with juicing capabilities. Complete kitchen solution.',
                'specifications' => [
                    'Type' => '3 in 1 Blender',
                    'Functions' => 'Blending, Grinding, Juicing',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/Juicer-PNG-1-scaled-800x800.jpeg',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function createProducts(array $products, ?Category $category, ?Brand $brand): void
    {
        if (!$category || !$brand) {
            return;
        }

        foreach ($products as $productData) {
            $imageUrl = $productData['image'] ?? null;
            unset($productData['image']);

            $sku = $productData['sku'];
            unset($productData['sku']);

            $product = Product::firstOrCreate(
                ['sku' => $sku],
                array_merge($productData, [
                    'sku' => $sku,
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'is_active' => true,
                    'track_inventory' => true,
                    'stock_quantity' => ($productData['stock_status'] ?? 'in_stock') === 'in_stock' ? 100 : 0,
                    'low_stock_threshold' => 10,
                    'warranty_period' => '1 Year',
                ])
            );

            if ($imageUrl && $product->wasRecentlyCreated) {
                ProductImage::firstOrCreate(
                    ['product_id' => $product->id, 'is_primary' => true],
                    [
                        'image' => $imageUrl,
                        'alt_text' => $product->name,
                        'sort_order' => 0,
                    ]
                );
            }
        }
    }
}
