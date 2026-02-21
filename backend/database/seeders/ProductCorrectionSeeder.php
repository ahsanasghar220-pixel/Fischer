<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductCorrectionSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================================
        // 1. Fix incorrect prices on Electric Water Coolers
        // ============================================================

        Product::where('sku', 'FE-100-SS')->update(['price' => 117000]);
        Product::where('sku', 'FE-150-SS')->update(['price' => 156000]);

        // ============================================================
        // 2. Fix Storage Coolers — wrong capacities on FST 400 & 600
        //    Reference data: FST 300 (425,000) and FST 500 (600,000)
        // ============================================================

        $fst300 = Product::where('sku', 'FST-400')->first();
        if ($fst300) {
            $fst300->update([
                'name'              => 'Self-Contained Storage Water Cooler FST 300',
                'sku'               => 'FST-300',
                'model_number'      => 'FST 300 S.S',
                'price'             => 425000,
                'short_description' => '300L storage water cooler with S.S tank, copper coiling, 4 taps + extra point. Double compressor.',
                'specifications'    => [
                    'Storage Capacity'           => '300 Litres',
                    'Number of Taps'             => '4 + Extra Point',
                    'Dimensions'                 => 'H: 78″; W: 40″; D: 30″',
                    'Water Tank Material'        => 'Non Magnetic Stainless Steel (304 type Food Grade)',
                    'Coiling around Water Tank'  => '100% Pure Copper',
                    'Body Material'              => 'Stainless Steel',
                    'Refrigerant'                => 'R 134a CFC Free',
                    'Compressor'                 => 'Double Compressor — Brand New',
                ],
            ]);
        }

        $fst500 = Product::where('sku', 'FST-600')->first();
        if ($fst500) {
            $fst500->update([
                'name'              => 'Self-Contained Storage Water Cooler FST 500',
                'sku'               => 'FST-500',
                'model_number'      => 'FST 500 S.S',
                'price'             => 600000,
                'short_description' => '500L storage water cooler with S.S tank, copper coiling, 4 taps + extra point. Double compressor.',
                'specifications'    => [
                    'Storage Capacity'           => '500 Litres',
                    'Number of Taps'             => '4 + Extra Point',
                    'Dimensions'                 => 'H: 81″; W: 48″; D: 48″',
                    'Water Tank Material'        => 'Non Magnetic Stainless Steel (304 type Food Grade)',
                    'Coiling around Water Tank'  => '100% Pure Copper',
                    'Body Material'              => 'Stainless Steel',
                    'Refrigerant'                => 'R 134a CFC Free',
                    'Compressor'                 => 'Double Compressor — Brand New',
                ],
            ]);
        }

        // ============================================================
        // 3. Remove erroneous "Electric Water Cooler 1000 Ltr/Hr"
        //    listed under Water Coolers — not in product reference
        // ============================================================

        Product::where('sku', 'FE-1000-SS')->delete();

        // ============================================================
        // 4. Add three missing Water Cooler products
        // ============================================================

        $waterCoolers = Category::where('slug', 'water-coolers')->first();
        if (! $waterCoolers) {
            return;
        }

        $brandId = Product::where('category_id', $waterCoolers->id)->value('brand_id');

        // 4a — FE 125 S.S (completely missing from site)
        Product::firstOrCreate(
            ['sku' => 'FE-125-SS'],
            [
                'category_id'       => $waterCoolers->id,
                'brand_id'          => $brandId,
                'name'              => 'Electric Water Cooler FE 125 S.S',
                'model_number'      => 'FE 125 S.S',
                'price'             => 130000,
                'short_description' => '125 Ltr/Hr electric water cooler for 150-200 people with 4 taps.',
                'description'       => 'Commercial-grade electric water cooler with 125 litres/hour cooling capacity, suitable for 150-200 people. Features food-grade non-magnetic stainless steel water tank, 100% pure copper external coiling, CFC-free R134a refrigerant, and brand new compressors, condensers and fan motors.',
                'specifications'    => [
                    'Cooling Capacity'           => '125 Ltr/Hr',
                    'Suitable for People'        => '150 to 200',
                    'Number of Taps'             => '4',
                    'Dimensions'                 => 'H: 56″; W: 30″; D: 20″',
                    'Water Tank Material'        => 'Non Magnetic Stainless Steel (Food Grade)',
                    'Coiling around Water Tank'  => '100% Pure Copper',
                    'Body Material'              => 'Stainless Steel',
                    'Refrigerant'                => 'R 134a CFC Free',
                    'Compressor'                 => 'Brand New Compressors, Condensers and Fan Motors',
                ],
                'stock_status'      => 'in_stock',
                'stock_quantity'    => 100,
                'is_active'         => true,
                'is_featured'       => false,
                'is_new'            => false,
                'is_bestseller'     => false,
                'track_inventory'   => true,
                'low_stock_threshold' => 10,
                'warranty_period'   => '1 Year',
            ]
        );

        // 4b — Fountain Type Water Cooler 45 Ltr/Hr
        Product::firstOrCreate(
            ['sku' => 'FF-45-SS'],
            [
                'category_id'       => $waterCoolers->id,
                'brand_id'          => $brandId,
                'name'              => 'Fountain Type Water Cooler 45 Ltr/Hr',
                'model_number'      => 'FF 45 S.S',
                'price'             => 75000,
                'short_description' => 'Fountain type water cooler, 45 Ltr/Hr cooling capacity, 2 taps, stainless steel body.',
                'description'       => 'Fountain type electric water cooler with 45 litres/hour cooling capacity. Compact upright design with food-grade non-magnetic stainless steel water tank, 100% pure copper coiling, CFC-free R134a refrigerant, and brand new compressors, condensers and fan motors.',
                'specifications'    => [
                    'Cooling Capacity'           => '45 Ltr/Hr',
                    'Number of Taps'             => '2',
                    'Dimensions'                 => 'H: 42″; W: 18″; D: 16″',
                    'Water Tank Material'        => 'Non Magnetic Stainless Steel (Food Grade)',
                    'Coiling around Water Tank'  => '100% Pure Copper',
                    'Body Material'              => 'Stainless Steel',
                    'Refrigerant'                => 'R 134a CFC Free',
                    'Compressor'                 => 'Brand New Compressors, Condensers and Fan Motors',
                ],
                'stock_status'      => 'in_stock',
                'stock_quantity'    => 100,
                'is_active'         => true,
                'is_featured'       => false,
                'is_new'            => false,
                'is_bestseller'     => false,
                'track_inventory'   => true,
                'low_stock_threshold' => 10,
                'warranty_period'   => '1 Year',
            ]
        );

        // 4c — Bottle Type Electric Water Cooler 40 Ltr/Hr
        Product::firstOrCreate(
            ['sku' => 'FB-40-SS'],
            [
                'category_id'       => $waterCoolers->id,
                'brand_id'          => $brandId,
                'name'              => 'Bottle Type Electric Water Cooler 40 Ltr/Hr',
                'model_number'      => 'FB 40 S.S',
                'price'             => 58750,
                'short_description' => 'Bottle type electric water cooler, 40 Ltr/Hr cooling capacity, 2 taps, stainless steel body.',
                'description'       => 'Bottle type electric water cooler with 40 litres/hour cooling capacity. Space-efficient bottle design with food-grade non-magnetic stainless steel water tank, 100% pure copper coiling, CFC-free R134a refrigerant, and brand new compressors, condensers and fan motors.',
                'specifications'    => [
                    'Cooling Capacity'           => '40 Ltr/Hr',
                    'Number of Taps'             => '2',
                    'Dimensions'                 => 'H: 46″; W: 16″; D: 15″',
                    'Water Tank Material'        => 'Non Magnetic Stainless Steel (Food Grade)',
                    'Coiling around Water Tank'  => '100% Pure Copper',
                    'Body Material'              => 'Stainless Steel',
                    'Refrigerant'                => 'R 134a CFC Free',
                    'Compressor'                 => 'Brand New Compressors, Condensers and Fan Motors',
                ],
                'stock_status'      => 'in_stock',
                'stock_quantity'    => 100,
                'is_active'         => true,
                'is_featured'       => false,
                'is_new'            => false,
                'is_bestseller'     => false,
                'track_inventory'   => true,
                'low_stock_threshold' => 10,
                'warranty_period'   => '1 Year',
            ]
        );
    }
}
