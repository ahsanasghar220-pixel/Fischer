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

        // Seed all product categories
        $this->seedKitchenHoods($brand);
        $this->seedKitchenHobs($brand);
        $this->seedGasWaterHeaters($brand);
        $this->seedHybridGeysers($brand);
        $this->seedFastElectricWaterHeaters($brand);
        $this->seedInstantElectricWaterHeaters($brand);
        $this->seedWaterCoolers($brand);
        $this->seedSlimWaterCoolers($brand);
        $this->seedWaterDispensers($brand);
        $this->seedStorageCoolers($brand);
        $this->seedOvenToasters($brand);
        $this->seedAirFryers($brand);
        $this->seedCookingRanges($brand);
        $this->seedAccessories($brand);
    }

    private function seedKitchenHoods(Brand $brand): void
    {
        $category = Category::where('slug', 'built-in-hoods')->first();

        $products = [
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
                'image' => '/images/products/kitchen-hoods/fkh-t90-05s.png',
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
                    'Lighting' => 'LED Lamp',
                ],
                'image' => '/images/products/kitchen-hoods/fkh-h90-06s.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-03IN',
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
                'image' => '/images/products/kitchen-hoods/fkh-t90-03in.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-S90-02IN',
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
                'image' => '/images/products/kitchen-hoods/fkh-s90-02in.png',
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
                'image' => '/images/products/kitchen-hoods/fkh-t90-04sc.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
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
                'image' => '/images/products/kitchen-hoods/fkh-l90-01in.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedKitchenHobs(Brand $brand): void
    {
        $category = Category::where('slug', 'built-in-hobs')->first();

        $products = [
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
                'image' => '/images/products/kitchen-hobs/fbh-ss76-3eps.png',
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
                'image' => '/images/products/kitchen-hobs/fbh-ss84-3sbf.png',
                'stock_status' => 'in_stock',
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
                'image' => '/images/products/kitchen-hobs/fbh-ss76-3cb.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
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
                'image' => '/images/products/kitchen-hobs/fbh-g78-3cb.png',
                'stock_status' => 'in_stock',
                'is_new' => true,
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
                'image' => '/images/products/kitchen-hobs/fbh-g78-3cb-matte.png',
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
                'image' => '/images/products/kitchen-hobs/fbh-g90-5sbf.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
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
                'image' => '/images/products/kitchen-hobs/fbh-ss90-5sbf.png',
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
                'image' => '/images/products/kitchen-hobs/fbh-ss86-3cb.png',
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
                'name' => 'Instant Gas Water Heater 6 Liter',
                'sku' => 'FIGWH-6L',
                'model_number' => '6 Liter',
                'price' => 21250,
                'short_description' => '6 Liter Instant Gas Water Heater',
                'description' => 'Compact 6 liter instant gas water heater for quick hot water supply.',
                'specifications' => [
                    'Capacity' => '6 Liter',
                    'Type' => 'Instant Gas',
                ],
                'image' => '/images/products/gas-water-heaters/figwh-6l.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Instant Gas Water Heater 8 Liter',
                'sku' => 'FIGWH-8L',
                'model_number' => '8 Liter',
                'price' => 24500,
                'short_description' => '8 Liter Instant Gas Water Heater',
                'description' => '8 liter instant gas water heater for medium-demand hot water supply.',
                'specifications' => [
                    'Capacity' => '8 Liter',
                    'Type' => 'Instant Gas',
                ],
                'image' => '/images/products/gas-water-heaters/figwh-8l.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Instant Gas Water Heater 10 Liter',
                'sku' => 'FIGWH-10L',
                'model_number' => '10 Liter',
                'price' => 32500,
                'short_description' => '10 Liter Instant Gas Water Heater',
                'description' => '10 liter instant gas water heater for continuous hot water supply.',
                'specifications' => [
                    'Capacity' => '10 Liter',
                    'Type' => 'Instant Gas',
                ],
                'image' => '/images/products/gas-water-heaters/figwh-10l.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Gas Geyser 35 Gallon',
                'sku' => 'FGG-35G',
                'model_number' => '35 Gallon',
                'price' => 47500,
                'compare_price' => 59000,
                'short_description' => '35 Gallon Gas Geyser with Multiple Variants',
                'description' => '35 Gallon capacity gas geyser. Multiple variants available.',
                'specifications' => [
                    'Capacity' => '35 Gallon',
                    'Type' => 'Gas Geyser',
                ],
                'image' => '/images/products/gas-water-heaters/fgg-35g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Gas Geyser 55 Gallon',
                'sku' => 'FGG-55G',
                'model_number' => '55 Gallon',
                'price' => 72000,
                'compare_price' => 81000,
                'short_description' => '55 Gallon Gas Geyser with Multiple Variants',
                'description' => '55 Gallon capacity gas geyser for larger households.',
                'specifications' => [
                    'Capacity' => '55 Gallon',
                    'Type' => 'Gas Geyser',
                ],
                'image' => '/images/products/gas-water-heaters/fgg-55g.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Gas Geyser 65 Gallon',
                'sku' => 'FGG-65G',
                'model_number' => '65 Gallon',
                'price' => 78000,
                'short_description' => '65 Gallon Gas Geyser for Large Families',
                'description' => '65 Gallon capacity gas geyser for large families.',
                'specifications' => [
                    'Capacity' => '65 Gallon',
                    'Type' => 'Gas Geyser',
                ],
                'image' => '/images/products/gas-water-heaters/fgg-65g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Gas Geyser Heavy Duty 100 Gallon',
                'sku' => 'FGG-100G-HD',
                'model_number' => '100 Gallon HD',
                'price' => 130000,
                'short_description' => '100 Gallon Heavy Duty Gas Geyser, Imported Thermostat, Auto Ignition',
                'description' => '100 Gallon heavy duty gas geyser with imported gas thermostat, auto ignition, imported glass wool insulation, and 9/10 inner tank.',
                'specifications' => [
                    'Capacity' => '100 Gallon',
                    'Type' => 'Gas Geyser Heavy Duty',
                    'Thermostat' => 'Imported with Auto Ignition',
                    'Insulation' => 'Imported Glass Wool',
                    'Inner Tank' => '9/10 Gauge',
                ],
                'image' => '/images/products/gas-water-heaters/fgg-100g-hd.png',
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
                'name' => 'Hybrid Electric + Gas Geyser 25 Gallon',
                'sku' => 'FHG-25G',
                'model_number' => '25 Gallon',
                'price' => 53000,
                'compare_price' => 58000,
                'short_description' => '25 Gallon Dual-Fuel Hybrid Geyser',
                'description' => '25 Gallon hybrid geyser with both electric and gas heating options. Popular choice for medium households.',
                'specifications' => [
                    'Capacity' => '25 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-25g.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 35 Gallon',
                'sku' => 'FHG-35G',
                'model_number' => '35 Gallon',
                'price' => 61000,
                'compare_price' => 69000,
                'short_description' => '35 Gallon Dual-Fuel Hybrid Geyser',
                'description' => '35 Gallon hybrid geyser with both electric and gas heating options. Larger capacity for bigger families.',
                'specifications' => [
                    'Capacity' => '35 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-35g.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 55 Gallon',
                'sku' => 'FHG-55G',
                'model_number' => '55 Gallon',
                'price' => 72000,
                'compare_price' => 81000,
                'short_description' => '55 Gallon Dual-Fuel Hybrid Geyser',
                'description' => '55 Gallon hybrid geyser with both electric and gas heating options. High capacity for large families.',
                'specifications' => [
                    'Capacity' => '55 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-55g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 65 Gallon',
                'sku' => 'FHG-65G',
                'model_number' => '65 Gallon',
                'price' => 90000,
                'short_description' => '65 Gallon Dual-Fuel Hybrid Geyser',
                'description' => '65 Gallon hybrid geyser with both electric and gas heating options.',
                'specifications' => [
                    'Capacity' => '65 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-65g.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Hybrid Gas Saver Water Heater Eco Model',
                'sku' => 'FHG-ECO',
                'model_number' => 'Eco Model',
                'price' => 58000,
                'compare_price' => 65000,
                'short_description' => 'Gas Saver Hybrid Eco Model',
                'description' => 'Hybrid gas saver water heater eco model. Multiple variants available.',
                'specifications' => [
                    'Type' => 'Hybrid Gas Saver',
                    'Model' => 'Eco',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-eco.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Hybrid Electric + Gas Geyser 100 Gallon Heavy Duty',
                'sku' => 'FHG-100G-HD',
                'model_number' => '100 Gallon Heavy Duty',
                'price' => 150000,
                'short_description' => '100 Gallon Heavy Duty Hybrid Geyser (2000W × 4)',
                'description' => 'Industrial grade 100 Gallon hybrid geyser. Auto ignition thermostat, Italian electric element, 9/10 inner tank, 2000W × 4 heating elements.',
                'specifications' => [
                    'Capacity' => '100 Gallon',
                    'Type' => 'Hybrid Heavy Duty',
                    'Electric Power' => '2000W × 4 (8000W)',
                    'Thermostat' => 'Auto Ignition',
                    'Element' => 'Italian Electric',
                    'Inner Tank' => '9/10 Gauge',
                ],
                'image' => '/images/products/hybrid-geysers/fhg-100g-hd.png',
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
                'name' => 'Fischer Fast Electric Water Heater F-30 Liter',
                'sku' => 'FFEW-F30',
                'model_number' => 'F-30',
                'price' => 23000,
                'short_description' => '30 Liter Fast Electric Water Heater',
                'description' => 'Compact 30 liter fast electric water heater. Single welded tank with thermal safety cutouts.',
                'specifications' => [
                    'Capacity' => '30 Liters',
                    'Type' => 'Fast Electric',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffew-f30.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-40 Liter',
                'sku' => 'FFEW-F40',
                'model_number' => 'F-40',
                'price' => 25000,
                'short_description' => '40 Liter Fast Electric Water Heater',
                'description' => '40 liter fast electric water heater for small families.',
                'specifications' => [
                    'Capacity' => '40 Liters',
                    'Type' => 'Fast Electric',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffew-f40.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.5,
                'is_featured' => true,
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-50 Liter',
                'sku' => 'FFEW-F50',
                'model_number' => 'F-50',
                'price' => 26500,
                'short_description' => '50 Liter Fast Electric Water Heater',
                'description' => '50 liter fast electric water heater for average families.',
                'specifications' => [
                    'Capacity' => '50 Liters',
                    'Type' => 'Fast Electric',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffew-f50.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-60 Liter',
                'sku' => 'FFEW-F60',
                'model_number' => 'F-60',
                'price' => 29000,
                'short_description' => '60 Liter Fast Electric Water Heater',
                'description' => '60 liter fast electric water heater for medium families.',
                'specifications' => [
                    'Capacity' => '60 Liters',
                    'Type' => 'Fast Electric',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffew-f60.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-80 Liter',
                'sku' => 'FFEW-F80',
                'model_number' => 'F-80',
                'price' => 34000,
                'short_description' => '80 Liter Fast Electric Water Heater',
                'description' => '80 liter fast electric water heater for larger families.',
                'specifications' => [
                    'Capacity' => '80 Liters',
                    'Type' => 'Fast Electric',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffew-f80.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-100 Liter',
                'sku' => 'FFEG-F100',
                'model_number' => 'F-100',
                'price' => 48000,
                'short_description' => '100 Liter Fast Electric Geyser',
                'description' => '100 liter fast electric geyser. Multiple variants available.',
                'specifications' => [
                    'Capacity' => '100 Liters',
                    'Type' => 'Fast Electric Geyser',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffeg-f100.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-140 Liter',
                'sku' => 'FFEG-F140',
                'model_number' => 'F-140',
                'price' => 57000,
                'short_description' => '140 Liter Fast Electric Geyser',
                'description' => '140 liter fast electric geyser. Multiple variants available.',
                'specifications' => [
                    'Capacity' => '140 Liters',
                    'Type' => 'Fast Electric Geyser',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffeg-f140.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-200 Liter',
                'sku' => 'FFEG-F200',
                'model_number' => 'F-200',
                'price' => 67000,
                'short_description' => '200 Liter Fast Electric Geyser',
                'description' => '200 liter fast electric geyser for commercial use.',
                'specifications' => [
                    'Capacity' => '200 Liters',
                    'Type' => 'Fast Electric Geyser',
                ],
                'image' => '/images/products/fast-electric-water-heaters/ffeg-f200.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Eco Watt Series Electric Water Heater',
                'sku' => 'FEW-ECOWATT',
                'model_number' => 'Eco Watt',
                'price' => 26000,
                'compare_price' => 33500,
                'short_description' => 'Eco Watt Series - 30-60L, Single Welded Tank, Adjustable Wattage',
                'description' => 'Eco Watt series electric water heater. Available in 30, 40, 50, 60 liters. Single welded tank, thermal safety cutouts, adjustable wattage (800-2000W), imported components.',
                'specifications' => [
                    'Capacities' => '30, 40, 50, 60 Liters',
                    'Tank' => 'Single Welded',
                    'Wattage' => '800-2000W Adjustable',
                    'Components' => 'Imported',
                    'Safety' => 'Thermal Cutouts',
                ],
                'image' => '/images/products/fast-electric-water-heaters/few-ecowatt.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'average_rating' => 5.0,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedInstantElectricWaterHeaters(Brand $brand): void
    {
        $category = Category::where('slug', 'instant-electric-water-heaters')->first();

        $products = [
            [
                'name' => 'Instant Cum Storage Electric Water Heater 10L',
                'sku' => 'FICS-10L',
                'model_number' => '10L',
                'price' => 17000,
                'short_description' => '10 Liter Instant Cum Storage Electric Water Heater',
                'description' => '10 liter instant cum storage electric water heater. Quick heating with storage capability.',
                'specifications' => [
                    'Capacity' => '10 Liters',
                    'Type' => 'Instant Cum Storage',
                ],
                'image' => '/images/products/instant-electric-water-heaters/fics-10l.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Instant Cum Storage Electric Water Heater 15L',
                'sku' => 'FICS-15L',
                'model_number' => '15L',
                'price' => 19000,
                'short_description' => '15 Liter Instant Cum Storage Electric Water Heater',
                'description' => '15 liter instant cum storage electric water heater. Perfect balance of instant heating and storage.',
                'specifications' => [
                    'Capacity' => '15 Liters',
                    'Type' => 'Instant Cum Storage',
                ],
                'image' => '/images/products/instant-electric-water-heaters/fics-15l.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Instant Cum Storage Electric Water Heater 30L',
                'sku' => 'FICS-30L',
                'model_number' => '30L',
                'price' => 24000,
                'short_description' => '30 Liter Instant Cum Storage Electric Water Heater',
                'description' => '30 liter instant cum storage electric water heater. Larger capacity for family use.',
                'specifications' => [
                    'Capacity' => '30 Liters',
                    'Type' => 'Instant Cum Storage',
                ],
                'image' => '/images/products/instant-electric-water-heaters/fics-30l.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
            [
                'name' => 'Instant Electric Water Heater with Storage 20L',
                'sku' => 'FIEWHS-20L',
                'model_number' => '20L',
                'price' => 30000,
                'short_description' => '20 Liter Instant Electric Water Heater with Storage',
                'description' => '20 liter instant electric water heater with storage.',
                'specifications' => [
                    'Capacity' => '20 Liters',
                    'Type' => 'Instant Electric with Storage',
                ],
                'image' => '/images/products/instant-electric-water-heaters/fiewhs-20l.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Instant Electric Water Heater with Storage 25L',
                'sku' => 'FIEWHS-25L',
                'model_number' => '25L',
                'price' => 32000,
                'short_description' => '25 Liter Instant Electric Water Heater with Storage',
                'description' => '25 liter instant electric water heater with storage.',
                'specifications' => [
                    'Capacity' => '25 Liters',
                    'Type' => 'Instant Electric with Storage',
                ],
                'image' => '/images/products/instant-electric-water-heaters/fiewhs-25l.png',
                'stock_status' => 'out_of_stock',
                'average_rating' => 4.5,
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
            [
                'name' => 'Electric Water Cooler 1000 Ltr/Hr',
                'sku' => 'FE-1000-SS',
                'model_number' => 'FE 1000 S.S',
                'price' => 600000,
                'short_description' => '1000 Ltr/Hr (300L/Hr Cooling), 4 Taps + Extra Point, Dual Compressor, 1000-1400 People',
                'description' => 'Industrial grade water cooler with 1000 Ltr/Hr capacity (300L/Hr cooling). Stainless steel with pure copper coiling. 4 taps plus extra point. Dual compressor. Suitable for 1000-1400 people.',
                'specifications' => [
                    'Cooling Capacity' => '1000 Ltr/Hr (300L/Hr Cooling)',
                    'Suitable For' => '1000-1400 people',
                    'Taps' => '4 + Extra Point',
                    'Compressors' => 'Dual',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => '/images/products/water-coolers/fe-1000-ss.png',
                'stock_status' => 'in_stock',
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
                'image' => '/images/products/slim-water-coolers/fe-35-slim.png',
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
                'image' => '/images/products/slim-water-coolers/fe-45-slim.png',
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
                'image' => '/images/products/slim-water-coolers/fe-65-slim.png',
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
                'image' => '/images/products/water-dispensers/fwd-bottle.png',
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
                'image' => '/images/products/water-dispensers/fwd-fountain.png',
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
                'image' => '/images/products/water-dispensers/fwd-1150.png',
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
                'image' => '/images/products/storage-coolers/fst-25.png',
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
                'image' => '/images/products/storage-coolers/fst-50.png',
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
                'image' => '/images/products/storage-coolers/fst-100.png',
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
                'image' => '/images/products/storage-coolers/fst-200.png',
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
                'image' => '/images/products/storage-coolers/fst-400.png',
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
                'image' => '/images/products/storage-coolers/fst-600.png',
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
                'image' => '/images/products/storage-coolers/fst-1000.png',
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
                'image' => '/images/products/oven-toasters/fot-1901d.png',
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
                'image' => '/images/products/oven-toasters/fot-2501c.png',
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
                'image' => '/images/products/air-fryers/faf-401wd.png',
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
                'image' => '/images/products/air-fryers/faf-601wd.png',
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
                'image' => '/images/products/air-fryers/faf-801wd.png',
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
            // Cooking Cabinets
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
                'image' => '/images/products/cooking-ranges/fcc-3b.png',
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
                'image' => '/images/products/cooking-ranges/fcc-5b.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Single Door Cooking Cabinet 3 Burner',
                'sku' => 'FCC-3B-SD',
                'model_number' => '3 Burner Single Door',
                'price' => 23500,
                'short_description' => '3 Burner, 27", Single Door, Metal Top',
                'description' => 'Compact single door 3 burner cooking cabinet with metal top.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '27"',
                    'Doors' => 'Single Door',
                    'Top' => 'Metal',
                ],
                'image' => '/images/products/cooking-ranges/fcc-3b-sd.png',
                'stock_status' => 'in_stock',
            ],
            // Cooking Ranges - Brass Burner
            [
                'name' => 'Cooking Range 3 Brass Burner',
                'sku' => 'FCR-3BB',
                'model_number' => '3 Brass Burner',
                'price' => 42000,
                'short_description' => '34", 3 Brass Burners, Stainless Steel Body, Auto Ignition, Mercury Glass',
                'description' => 'Premium cooking range with 3 brass burners. Stainless steel body/base, double door, auto ignition, mercury glass front and top.',
                'specifications' => [
                    'Burners' => '3 Brass',
                    'Width' => '34"',
                    'Body' => 'Stainless Steel',
                    'Ignition' => 'Auto',
                    'Glass' => 'Mercury Glass Front and Top',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3bb.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Cooking Range 5 Brass Burner',
                'sku' => 'FCR-5BB',
                'model_number' => '5 Brass Burner',
                'price' => 43000,
                'short_description' => '34", 5 Brass Burners, Stainless Steel, Auto Ignition, Mercury Glass',
                'description' => 'Professional cooking range with 5 brass burners. Full stainless steel construction with auto ignition and mercury glass finish.',
                'specifications' => [
                    'Burners' => '5 Brass',
                    'Width' => '34"',
                    'Body' => 'Stainless Steel',
                    'Ignition' => 'Auto',
                    'Glass' => 'Mercury Glass',
                ],
                'image' => '/images/products/cooking-ranges/fcr-5bb.png',
                'stock_status' => 'out_of_stock',
            ],
            // Cooking Ranges with Accessories
            [
                'name' => 'Cooking Range 3 Brass Burner + Deep Fryer',
                'sku' => 'FCR-3BB-DF',
                'model_number' => '3 Brass Burner + Deep Fryer',
                'price' => 55000,
                'short_description' => '3 Brass Burner with Built-in Deep Fryer',
                'description' => 'Cooking range with 3 brass burners and built-in deep fryer.',
                'specifications' => [
                    'Burners' => '3 Brass',
                    'Accessories' => 'Deep Fryer',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3bb-df.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
                'is_featured' => true,
            ],
            [
                'name' => 'Cooking Range 3 Burner + Deep Fryer',
                'sku' => 'FCR-3B-DF',
                'model_number' => '3 Burner + Deep Fryer',
                'price' => 39000,
                'short_description' => '3 Burner with Built-in Deep Fryer',
                'description' => 'Cooking range with 3 burners and built-in deep fryer.',
                'specifications' => [
                    'Burners' => '3',
                    'Accessories' => 'Deep Fryer',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3b-df.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Cooking Range 3 Burner + Roasting Grill',
                'sku' => 'FCR-3B-RG',
                'model_number' => '3 Burner + Roasting Grill',
                'price' => 47500,
                'short_description' => '3 Burner, 34", Double Door, Metal Top, SS Panels, Roasting Grill',
                'description' => 'Cooking range with 3 burners and roasting grill. 34", double door, metal top, stainless steel panels.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                    'Panels' => 'Stainless Steel',
                    'Accessories' => 'Roasting Grill',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3b-rg.png',
                'stock_status' => 'in_stock',
                'is_bestseller' => true,
            ],
            [
                'name' => 'Cooking Range 5 Burner + Pizza Baker',
                'sku' => 'FCR-5B-PB',
                'model_number' => '5 Burner + Pizza Baker',
                'price' => 56000,
                'short_description' => '5 Burner with Built-in Pizza Baker',
                'description' => 'Cooking range with 5 burners and built-in pizza baker for versatile cooking.',
                'specifications' => [
                    'Burners' => '5',
                    'Accessories' => 'Pizza Baker',
                ],
                'image' => '/images/products/cooking-ranges/fcr-5b-pb.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Cooking Range 5 Burner + Roasting Grill',
                'sku' => 'FCR-5B-RG',
                'model_number' => '5 Burner + Roasting Grill',
                'price' => 49000,
                'short_description' => '5 Burner, 34", Double Door, Metal Top, SS Panels, Roasting Grill',
                'description' => 'Cooking range with 5 burners and roasting grill. 34", double door, metal top, stainless steel panels.',
                'specifications' => [
                    'Burners' => '5',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                    'Panels' => 'Stainless Steel',
                    'Accessories' => 'Roasting Grill',
                ],
                'image' => '/images/products/cooking-ranges/fcr-5b-rg.png',
                'stock_status' => 'in_stock',
            ],
            // Single Door Cooking Ranges
            [
                'name' => 'Single Door Cooking Range 3 Brass Burner',
                'sku' => 'FCR-3BB-SD',
                'model_number' => '3 Brass Burner Single Door',
                'price' => 35000,
                'short_description' => '27", Stainless Steel Body, Auto Ignition, Mercury Glass',
                'description' => 'Compact single door cooking range with 3 brass burners. Stainless steel body, auto ignition, mercury glass front.',
                'specifications' => [
                    'Burners' => '3 Brass',
                    'Width' => '27"',
                    'Body' => 'Stainless Steel',
                    'Ignition' => 'Auto',
                    'Glass' => 'Mercury Glass Front',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3bb-sd.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Single Door Cooking Range 3 Burner',
                'sku' => 'FCR-3B-SD',
                'model_number' => '3 Burner Single Door',
                'price' => 37500,
                'short_description' => '27", Metal Top, Stainless Steel Panels',
                'description' => 'Compact single door cooking range with 3 burners. 27" width, metal top, stainless steel panels.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '27"',
                    'Top' => 'Metal',
                    'Panels' => 'Stainless Steel',
                ],
                'image' => '/images/products/cooking-ranges/fcr-3b-sd.png',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedAccessories(Brand $brand): void
    {
        $category = Category::where('slug', 'blenders-processors')->first();

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
                'image' => '/images/products/accessories/fac-irn.png',
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
                'image' => '/images/products/accessories/fac-bl2.png',
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
                'image' => '/images/products/accessories/fac-bl3.png',
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
