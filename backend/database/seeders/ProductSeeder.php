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

        // Water Coolers
        $this->seedWaterCoolers($brand);

        // Storage Type Water Coolers
        $this->seedStorageCoolers($brand);

        // Water Dispensers
        $this->seedWaterDispensers($brand);

        // Geysers & Heaters
        $this->seedGeysers($brand);

        // Cooking Ranges
        $this->seedCookingRanges($brand);

        // Built-in HOBs & Hoods
        $this->seedHobsAndHoods($brand);

        // Accessories
        $this->seedAccessories($brand);
    }

    private function seedWaterCoolers(Brand $brand): void
    {
        $category = Category::where('slug', 'water-coolers')->first();

        $products = [
            [
                'name' => 'Electric Water Cooler 35 Ltr/Hr',
                'sku' => 'FE-35-SS',
                'price' => 57500,
                'short_description' => 'Compact water cooler suitable for 35-70 people with 2 taps',
                'description' => 'Compact unit suitable for small offices with food-grade stainless steel construction. Features 35L/hr cooling capacity, pure copper coiling, and R134a refrigerant.',
                'specifications' => [
                    'Cooling Capacity' => '35 Ltr/Hr',
                    'Suitable For' => '35-70 people',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-35-ltr-hr-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Electric Water Cooler 45 Ltr/Hr',
                'sku' => 'FE-45-SS',
                'price' => 62500,
                'short_description' => 'Ideal for outdoor placement in schools and workshops, serves 45-90 people',
                'description' => 'Ideal for outdoor placement in schools and workshops. Features non-corrosive stainless steel construction with 45L/hr cooling capacity.',
                'specifications' => [
                    'Cooling Capacity' => '45 Ltr/Hr',
                    'Suitable For' => '45-90 people',
                    'Taps' => '2',
                    'Material' => 'Non-corrosive Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-45-ltr-hr-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler 65 Ltr/Hr',
                'sku' => 'FE-65-SS',
                'price' => 67500,
                'short_description' => 'High-capacity alternative for 65-130 people with 2 taps',
                'description' => 'High-capacity alternative to multiple low-capacity units. Serves 65-130 people with reliable cooling performance.',
                'specifications' => [
                    'Cooling Capacity' => '65 Ltr/Hr',
                    'Suitable For' => '65-130 people',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-65-ltr-hr-800x800.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Electric Water Cooler 80 Ltr/Hr',
                'sku' => 'FE-80-SS',
                'price' => 85000,
                'short_description' => 'Suitable for educational institutions, serves 80-160 people with 3 taps',
                'description' => 'Suitable for educational institutions and workshops with moderate demand. Features 3 taps for efficient water dispensing.',
                'specifications' => [
                    'Cooling Capacity' => '80 Ltr/Hr',
                    'Suitable For' => '80-160 people',
                    'Taps' => '3',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-80-ltr-hr.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler 100 Ltr/Hr',
                'sku' => 'FE-100-SS',
                'price' => 112500,
                'short_description' => 'Commercial-grade unit for 100-200 people with 4 taps',
                'description' => 'Commercial-grade unit reducing costs by eliminating multiple cooler purchases. Serves 100-200 people efficiently.',
                'specifications' => [
                    'Cooling Capacity' => '100 Ltr/Hr',
                    'Suitable For' => '100-200 people',
                    'Taps' => '4',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-100-ltr-hr-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
            ],
            [
                'name' => 'Electric Water Cooler 150 Ltr/Hr',
                'sku' => 'FE-150-SS',
                'price' => 140000,
                'short_description' => 'Heavy-duty construction for 150-300 people with 4 taps',
                'description' => 'Heavy-duty construction with 100% Pure Copper external coiling for contamination prevention. Serves 150-300 people.',
                'specifications' => [
                    'Cooling Capacity' => '150 Ltr/Hr',
                    'Suitable For' => '150-300 people',
                    'Taps' => '4',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper External',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-150-ltr-hr-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler 200 Ltr/Hr',
                'sku' => 'FE-200-SS',
                'price' => 262500,
                'short_description' => 'High-performance model for 200-400 people with 4 taps',
                'description' => 'High-performance model with brand new compressors, condensers and fan motors. Dimensions: 63"H × 32"W × 27"D.',
                'specifications' => [
                    'Cooling Capacity' => '200 Ltr/Hr',
                    'Suitable For' => '200-400 people',
                    'Taps' => '4',
                    'Dimensions' => '63"H × 32"W × 27"D',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FE-200-S.S.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler 300 Ltr/Hr',
                'sku' => 'FE-300-SS',
                'price' => 300000,
                'short_description' => 'Dual compressor system for 300-600 people with 4 taps + extra point',
                'description' => 'Largest commercial capacity available with dual compressor system. Designed for high-demand facilities serving 300-600 people.',
                'specifications' => [
                    'Cooling Capacity' => '300 Ltr/Hr',
                    'Suitable For' => '300-600 people',
                    'Taps' => '4 + Extra Point',
                    'Compressors' => 'Dual',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FE-300-S.S-2.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Electric Water Cooler 1000 Ltr/Hr',
                'sku' => 'FE-1000-SS',
                'price' => 600000,
                'short_description' => 'Premium industrial-scale unit for factories, schools, mosques - serves 1000-1400 people',
                'description' => 'Premium largest-capacity unit for factories, schools, mosques requiring industrial-scale cooling. Double compressor system.',
                'specifications' => [
                    'Cooling Capacity' => '1000 Ltr/Hr',
                    'Suitable For' => '1000-1400 people',
                    'Taps' => '4 + Extra Point',
                    'Compressors' => 'Double',
                    'Material' => 'Stainless Steel',
                    'Coiling' => '100% Pure Copper',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FE-300-S.S-2.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedStorageCoolers(Brand $brand): void
    {
        $category = Category::where('slug', 'storage-type-water-coolers')->first();

        $products = [
            [
                'name' => 'Water Cooler Storage Capacity 25 Liters',
                'sku' => 'FST-25-SS',
                'price' => 103000,
                'short_description' => 'Premium storage cooler with 25L capacity, 2 taps',
                'description' => 'Food grade Non-Magnetic Stainless Steel Water Tank with brand new compressor and copper fan motor. Fully copper coiling with CFC-free 134a refrigerant.',
                'specifications' => [
                    'Storage Capacity' => '25 Liters',
                    'Height' => '64"',
                    'Width' => '19.5"',
                    'Depth' => '19.5"',
                    'Taps' => '2',
                    'Material' => 'Food-grade Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/water-cooler-storage-capacity-25-liters.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Water Cooler Storage Capacity 50 Liters',
                'sku' => 'FST-50-SS',
                'price' => 145000,
                'short_description' => 'Mid-range storage cooler with 50L capacity, 2 taps',
                'description' => 'Stainless steel tank with new compressor and copper motor. All-copper coils with environmentally safe gas.',
                'specifications' => [
                    'Storage Capacity' => '50 Liters',
                    'Height' => '64"',
                    'Width' => '24"',
                    'Depth' => '24"',
                    'Taps' => '2',
                    'Material' => 'Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/FST-50-S.S-2.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Water Cooler Storage Capacity 100 Liters',
                'sku' => 'FST-100-SS',
                'price' => 225000,
                'short_description' => 'Large storage cooler with 100L capacity, 3 taps',
                'description' => 'Premium stainless steel construction with identical component specifications. 3 taps for efficient dispensing.',
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
                'name' => 'Water Cooler Storage Capacity 200 Liters',
                'sku' => 'FST-200-SS',
                'price' => 345000,
                'short_description' => 'Extra-large storage cooler with 200L capacity, 4 taps',
                'description' => 'Large-capacity stainless steel model with matching premium specifications. 4 taps for high-volume dispensing.',
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
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedWaterDispensers(Brand $brand): void
    {
        $category = Category::where('slug', 'water-dispensers')->first();

        $products = [
            [
                'name' => 'Water Dispenser Cooling Capacity 40 Liter',
                'sku' => 'FWD-40',
                'price' => 50000,
                'short_description' => 'Compact dispenser with 40L cooling capacity, 2 taps',
                'description' => 'Food grade Non-Magnetic Stainless Steel Water Tank. Brand New Compressor & Copper Fan Motor with 100% copper Coiling.',
                'specifications' => [
                    'Cooling Capacity' => '40 Liters',
                    'Height' => '46"',
                    'Width' => '16"',
                    'Depth' => '15"',
                    'Taps' => '2',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/water-dispenser-cooling-capacity-40-liter.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Water Dispenser Cooling Capacity 45 Liter',
                'sku' => 'FWD-45',
                'price' => 70000,
                'short_description' => 'Fountain type dispenser with 45L cooling capacity, 2 taps',
                'description' => 'Fountain type water dispenser with Food grade Non-Magnetic Stainless Steel Water Tank. Premium construction with copper coiling.',
                'specifications' => [
                    'Cooling Capacity' => '45 Liters',
                    'Height' => '42"',
                    'Width' => '18"',
                    'Depth' => '16"',
                    'Taps' => '2',
                    'Refrigerant' => 'CFC-free R134a',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/fountain-type-water-dispenser-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Water Dispenser FWD-1150',
                'sku' => 'FWD-1150',
                'price' => 38500,
                'short_description' => 'Compact home/office water dispenser',
                'description' => 'Quality water dispenser for home and small office use. ISO and PSQCA approved construction.',
                'specifications' => [
                    'Model' => 'FWD-1150',
                    'Type' => 'Standing Dispenser',
                    'Material' => 'Food-grade Components',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-16-at-7.46.04-PM-800x800.jpeg',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedGeysers(Brand $brand): void
    {
        $category = Category::where('slug', 'geysers-heaters')->first();

        $products = [
            [
                'name' => 'Eco Watt Series Electric Water Heater',
                'sku' => 'FEW-ECO',
                'price' => 26000,
                'compare_price' => 33500,
                'short_description' => 'Energy-efficient heater available in 30, 40, 50, 60 liters with adjustable wattage',
                'description' => 'Available in 30, 40, 50, 60 liters. Single welded tank with adjustable wattage (800/1200/2000 watts). Thermal safety cutouts and fully insulated.',
                'specifications' => [
                    'Capacities' => '30, 40, 50, 60 Liters',
                    'Wattage' => '800/1200/2000W Adjustable',
                    'Tank' => 'Single Welded',
                    'Safety' => 'Thermal Cutouts',
                    'Insulation' => 'Fully Insulated',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/07/1-3.jpg',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'is_bestseller' => true,
                'average_rating' => 5.0,
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-30 Liter',
                'sku' => 'FEW-30',
                'price' => 23000,
                'short_description' => '30 liter electric water heater for small households',
                'description' => 'Compact 30 liter electric water heater suitable for small households. Quality components with reliable heating performance.',
                'specifications' => [
                    'Capacity' => '30 Liters',
                    'Type' => 'Electric',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/WhatsApp-Image-2024-10-24-at-3.11.42-PM-800x800.jpeg',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-40 Liter',
                'sku' => 'FEW-40',
                'price' => 25000,
                'short_description' => '40 liter electric water heater for medium households',
                'description' => 'Medium capacity 40 liter electric water heater. Perfect for average household hot water needs.',
                'specifications' => [
                    'Capacity' => '40 Liters',
                    'Type' => 'Electric',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/WhatsApp-Image-2024-10-24-at-3.11.42-PM-1-800x800.jpeg',
                'stock_status' => 'in_stock',
                'average_rating' => 4.5,
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-50 Liter',
                'sku' => 'FEW-50',
                'price' => 26500,
                'short_description' => '50 liter electric water heater for larger households',
                'description' => '50 liter capacity for larger households. Reliable and efficient heating.',
                'specifications' => [
                    'Capacity' => '50 Liters',
                    'Type' => 'Electric',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/DSC00837-Photoroom-800x800.jpg',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-60 Liter',
                'sku' => 'FEW-60',
                'price' => 29000,
                'short_description' => '60 liter electric water heater for families',
                'description' => '60 liter capacity ideal for families. Consistent hot water supply.',
                'specifications' => [
                    'Capacity' => '60 Liters',
                    'Type' => 'Electric',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/DSC00846-Photoroom-2-800x800.jpg',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Water Heater F-80 Liter',
                'sku' => 'FEW-80',
                'price' => 34000,
                'short_description' => '80 liter electric water heater for large families',
                'description' => 'Large 80 liter capacity for bigger families or commercial light use.',
                'specifications' => [
                    'Capacity' => '80 Liters',
                    'Type' => 'Electric',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/DSC00825-Photoroom-800x800.jpg',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-100 Liter',
                'sku' => 'FEG-100',
                'price' => 48000,
                'short_description' => '100 liter electric geyser for commercial use',
                'description' => 'Commercial grade 100 liter electric geyser. Suitable for guest houses and small hotels.',
                'specifications' => [
                    'Capacity' => '100 Liters',
                    'Type' => 'Electric Geyser',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/electric-geyser-25-gallon-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-140 Liter',
                'sku' => 'FEG-140',
                'price' => 57000,
                'short_description' => '140 liter electric geyser for commercial establishments',
                'description' => 'High capacity 140 liter electric geyser for commercial establishments.',
                'specifications' => [
                    'Capacity' => '140 Liters',
                    'Type' => 'Electric Geyser',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/electric-geyser-35-gallon-800x800.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Fischer Fast Electric Geyser F-200 Liter',
                'sku' => 'FEG-200',
                'price' => 67000,
                'short_description' => '200 liter electric geyser for large commercial use',
                'description' => 'Industrial grade 200 liter electric geyser for large commercial applications.',
                'specifications' => [
                    'Capacity' => '200 Liters',
                    'Type' => 'Electric Geyser',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/electric-geyser-55-gallon-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Hybrid (Electric/Gas Geyser) 25 Gallon',
                'sku' => 'FHG-25',
                'price' => 53000,
                'compare_price' => 58000,
                'short_description' => 'Dual-fuel hybrid geyser with electric and gas options',
                'description' => 'Hybrid geyser with both electric and gas heating options. Flexible fuel choice for year-round use.',
                'specifications' => [
                    'Capacity' => '25 Gallon',
                    'Type' => 'Hybrid (Electric/Gas)',
                    'Flexibility' => 'Dual Fuel Options',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/25-gallon-hybrid-3-removebg-preview.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Fischer Hybrid (Electric/Gas Geyser) 100 Gallon Heavy Duty',
                'sku' => 'FHG-100-HD',
                'price' => 150000,
                'short_description' => 'Heavy duty 100 gallon hybrid geyser with 8000W heating',
                'description' => 'Imported gas thermostat with auto ignition. Imported glass wool insulation. Italian electric element + thermostat. 9/10 inner tank with 2000W × 4 heating.',
                'specifications' => [
                    'Capacity' => '100 Gallon',
                    'Type' => 'Hybrid Heavy Duty',
                    'Electric Power' => '2000W × 4',
                    'Gas Thermostat' => 'Imported with Auto Ignition',
                    'Insulation' => 'Imported Glass Wool',
                    'Element' => 'Italian Electric + Thermostat',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/07/hybrid-electric-gas-geyser-100-gallon-800x800.png',
                'stock_status' => 'in_stock',
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
                'price' => 28500,
                'short_description' => '3 Burner, 34", Double Door, Metal Top cooking cabinet',
                'description' => 'Affordable 3 burner cooking cabinet with metal top. Double door storage and 34" width.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-cabinet-3-burner-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Cooking Cabinet 5 Burner',
                'sku' => 'FCC-5B',
                'price' => 29500,
                'short_description' => '5 Burner, 34", Double Door, Metal Top cooking cabinet',
                'description' => '5 burner cooking cabinet with metal top. Double door storage and 34" width.',
                'specifications' => [
                    'Burners' => '5',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Top' => 'Metal',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-cabinet-5-burner-800x800.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Cooking Range 3 Brass Burner',
                'sku' => 'FCR-3BB',
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-3-brass-burner-800x800.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Cooking Range 3 Brass Burner Plus Deep Fryer',
                'sku' => 'FCR-3BB-DF',
                'price' => 55000,
                'short_description' => '34 M-3 + Deep Fryer with brass burners',
                'description' => 'Cooking range with 3 brass burners plus integrated deep fryer. Perfect for versatile cooking needs.',
                'specifications' => [
                    'Burners' => '3 Brass',
                    'Width' => '34"',
                    'Extra' => 'Deep Fryer',
                    'Body' => 'Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-3-brass-burner-plus-deep-fryer-800x800.png',
                'stock_status' => 'in_stock',
                'average_rating' => 4.0,
            ],
            [
                'name' => 'Cooking Range 3 Burner Plus Roasting Grill',
                'sku' => 'FCR-3B-RG',
                'price' => 47500,
                'short_description' => '3 Burner, 34", Stainless Steel Panels with Roasting Grill',
                'description' => '3 Burner cooking range with integrated roasting grill. Both panels in stainless steel.',
                'specifications' => [
                    'Burners' => '3',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Panels' => 'Both S.S.',
                    'Extra' => 'Roasting Grill',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-3-burner-plus-roasting-grill-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Cooking Range 5 Brass Burner',
                'sku' => 'FCR-5BB',
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
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-5-brass-burner-800x800.png',
                'stock_status' => 'out_of_stock',
            ],
            [
                'name' => 'Cooking Range 5 Burner Plus Pizza Baker',
                'sku' => 'FCR-5B-PB',
                'price' => 56000,
                'short_description' => '34 M-5 + Pizza Baker for professional cooking',
                'description' => '5 burner cooking range with integrated pizza baker. Professional grade for versatile cooking.',
                'specifications' => [
                    'Burners' => '5',
                    'Width' => '34"',
                    'Extra' => 'Pizza Baker',
                    'Body' => 'Stainless Steel',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-5-burner-plus-pizza-baker-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Cooking Range 5 Burner Plus Roasting Grill',
                'sku' => 'FCR-5B-RG',
                'price' => 49000,
                'short_description' => '5 Burner, 34", Stainless Steel Panels with Roasting Grill',
                'description' => '5 Burner cooking range with integrated roasting grill. Premium stainless steel panels.',
                'specifications' => [
                    'Burners' => '5',
                    'Width' => '34"',
                    'Doors' => 'Double Door',
                    'Panels' => 'Both S.S.',
                    'Extra' => 'Roasting Grill',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/cooking-range-5-burner-plus-roasting-grill-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Oven Toaster - 35L',
                'sku' => 'FOT-35',
                'price' => 28750,
                'short_description' => '35L Digital Display, 1500W, 11-in-1 Functions',
                'description' => 'Digital display oven toaster with 11-in-1 functions. 1500W power with 120-minute timer.',
                'specifications' => [
                    'Capacity' => '35L',
                    'Power' => '1500W',
                    'Display' => 'Digital',
                    'Functions' => '11-in-1',
                    'Timer' => '120 minutes',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2022/06/35-L-800x800.jpg',
                'stock_status' => 'in_stock',
                'is_new' => true,
            ],
            [
                'name' => 'Oven Toaster - 48L',
                'sku' => 'FOT-48',
                'price' => 31875,
                'short_description' => '48L Mechanical Control, 1800W, Convection Function',
                'description' => 'Large capacity oven toaster with mechanical control. 1800W power with convection function and 60-minute timer.',
                'specifications' => [
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

    private function seedHobsAndHoods(Brand $brand): void
    {
        $category = Category::where('slug', 'built-in-hobs')->first();

        $products = [
            [
                'name' => 'Kitchen Hob FBH-G78-3CB',
                'sku' => 'FBH-G78-3CB',
                'price' => 40625,
                'short_description' => '780mm Tempered Glass, Cast Iron Pan Support, Brass Burner',
                'description' => '780mm Tempered glass surface panel. Cast iron pan support with corner/Metal knobs/brass burner. 1.5V battery pulse ignition.',
                'specifications' => [
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
                'sku' => 'FBH-G78-3CB-M',
                'price' => 40000,
                'short_description' => '8mm Tempered Glass Panel with Fine Matte Finish, Flame Failure Safety',
                'description' => '8mm Tempered Glass Panel with Fine Matte Finish. Metal Steel Matt Enamel Pan Support. 3-in-1 Aluminium Burner Base with Brass Burner Caps. Flame Failure Safety Device.',
                'specifications' => [
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
                'price' => 43125,
                'short_description' => '8mm Tempered Glass, SABAF Burner, 5 Burner Hob',
                'description' => '8mm tempered glass panel with cast iron pan support. Metal knobs with SABAF burner. 1.5V battery pulse ignition.',
                'specifications' => [
                    'Panel' => '8mm Tempered Glass',
                    'Pan Support' => 'Cast Iron',
                    'Burner' => 'SABAF',
                    'Burner Count' => '5',
                    'Ignition' => '1.5V Battery Pulse',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-G90-5SBF-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hob FBH-SS76-3CB',
                'sku' => 'FBH-SS76-3CB',
                'price' => 39000,
                'short_description' => '0.8mm Stainless Steel Brushed Panel, Brass Burner Caps',
                'description' => '0.8mm Stainless Steel Brushed Panel. Heavy Cast iron pan support with brass burner caps. Flame failure safety device.',
                'specifications' => [
                    'Panel' => '0.8mm Stainless Steel Brushed',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Brass Caps',
                    'Knobs' => 'Metal',
                    'Safety' => 'Flame Failure Device',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS76-3CB-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hob FBH-SS90-5SBF',
                'sku' => 'FBH-SS90-5SBF',
                'price' => 44375,
                'short_description' => '0.7mm Stainless Steel Panel, 5 Chinese SABAF Burners',
                'description' => '0.7mm Stainless Steel Surface panel. Heavy Cast iron pan support with Chinese SABAF burner. 5 burner configuration.',
                'specifications' => [
                    'Panel' => '0.7mm Stainless Steel',
                    'Pan Support' => 'Heavy Cast Iron',
                    'Burner' => 'Chinese SABAF',
                    'Burner Count' => '5',
                    'Ignition' => '1.5V Battery Pulse',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/07/FBH-SS90-5SBF-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-H90-06S',
                'sku' => 'FKH-H90-06S',
                'price' => 48825,
                'short_description' => '900mm Black Chimney, 1000 m³/h Airflow, Heat Auto Clean',
                'description' => '900mm Black Powder Coating Chimney + Panel. Airflow: 1000 m³/h. 270W Motor with Metal Blower. 3 Speed Gesture with Touch Control and Heat Auto Clean.',
                'specifications' => [
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
                'is_new' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-L90-01IN',
                'sku' => 'FKH-L90-01IN',
                'price' => 62500,
                'short_description' => '1500 m³/h Airflow, BLDC Copper Motor, Zero Vibration',
                'description' => 'Premium hood with 3 Speed + Boost. 1500 m³/h airflow with Heat Auto Clean. BLDC Copper Motor with low noise (52 dB) and zero vibration.',
                'specifications' => [
                    'Airflow' => '1500 m³/h',
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean',
                    'Noise' => '52 dB',
                    'Lighting' => 'Double LED Lamps',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-5-800x800.png',
                'stock_status' => 'in_stock',
                'is_featured' => true,
            ],
            [
                'name' => 'Kitchen Hood FKH-S90-02IN',
                'sku' => 'FKH-S90-02IN',
                'price' => 57500,
                'short_description' => '1200 m³/h Airflow, Slant Hood, Filterless Operation',
                'description' => 'Slant Hood with 3 Speed + Boost. Heat Auto Clean with Gesture and Touch Control. BLDC Copper Motor with filterless operation.',
                'specifications' => [
                    'Airflow' => '1200 m³/h',
                    'Style' => 'Slant Hood',
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean, Filterless',
                    'Thickness' => '0.6/0.7mm',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-1-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Kitchen Hood FKH-T90-03IN',
                'sku' => 'FKH-T90-03IN',
                'price' => 49375,
                'short_description' => '3 Speed + Boost, 3 Baffle Filters, BLDC Motor',
                'description' => '3 Speed + Boost with Heat Auto Clean. Gesture and Touch Control. BLDC Copper Motor with 3 baffle filters.',
                'specifications' => [
                    'Motor' => 'BLDC Copper',
                    'Control' => '3 Speed + Boost, Gesture & Touch',
                    'Features' => 'Heat Auto Clean',
                    'Filters' => '3 Baffle Filters (0.7mm)',
                    'Chimney Height' => '500mm',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2025/09/1-800x800.png',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function seedAccessories(Brand $brand): void
    {
        $category = Category::where('slug', 'accessories')->first();

        $products = [
            [
                'name' => 'Fischer 2 in 1 Blender',
                'sku' => 'FAC-BL2',
                'price' => 6960,
                'short_description' => 'Versatile 2-in-1 blender for kitchen use',
                'description' => 'Quality 2-in-1 blender from Fischer. Perfect for blending and grinding tasks.',
                'specifications' => [
                    'Type' => '2 in 1 Blender',
                    'Functions' => 'Blending, Grinding',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/Blender-800x800.png',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer 3 in 1 Blender',
                'sku' => 'FAC-BL3',
                'price' => 13050,
                'short_description' => 'Multi-function 3-in-1 blender and juicer',
                'description' => 'Premium 3-in-1 blender with juicing capabilities. Complete kitchen solution.',
                'specifications' => [
                    'Type' => '3 in 1 Blender',
                    'Functions' => 'Blending, Grinding, Juicing',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/Juicer-PNG-1-scaled-800x800.jpeg',
                'stock_status' => 'in_stock',
            ],
            [
                'name' => 'Fischer Iron',
                'sku' => 'FAC-IRN',
                'price' => 4800,
                'short_description' => 'Quality electric iron for household use',
                'description' => 'Reliable electric iron with quality heating element. Multiple variants available.',
                'specifications' => [
                    'Type' => 'Electric Iron',
                    'Variants' => 'Multiple Colors',
                ],
                'image' => 'https://fischerpk.com/wp-content/uploads/2024/09/White-Golden-Iron-800x800.png',
                'stock_status' => 'in_stock',
            ],
        ];

        $this->createProducts($products, $category, $brand);
    }

    private function createProducts(array $products, Category $category, Brand $brand): void
    {
        foreach ($products as $productData) {
            $imageUrl = $productData['image'] ?? null;
            unset($productData['image']);

            $product = Product::create(array_merge($productData, [
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
                'track_inventory' => true,
                'stock_quantity' => $productData['stock_status'] === 'in_stock' ? 100 : 0,
                'low_stock_threshold' => 10,
                'warranty_period' => '1 Year',
            ]));

            if ($imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $imageUrl,
                    'alt_text' => $product->name,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }
        }
    }
}
