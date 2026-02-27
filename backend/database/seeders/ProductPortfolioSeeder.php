<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ProductPortfolioSeeder
 *
 * Seeds all 6 Fischer water heater product lines with their
 * full Apple-style configurator variants (Series × Capacity × [Wattage]).
 *
 * Pricing notes:
 *  - Prices marked [CONFIRMED] were verified from physical price list images.
 *  - Prices marked [ESTIMATED] are approximations — update via Admin dashboard.
 *  - MRP (compare_price) = printed price on price list.
 *  - Price (selling) = handwritten red price on price list.
 *
 * Run:
 *   php artisan db:seed --class=AttributeSeeder         (run first)
 *   php artisan db:seed --class=ProductPortfolioSeeder
 */
class ProductPortfolioSeeder extends Seeder
{
    public function run(): void
    {
        // ── Load attribute values by name for easy lookup ─────────────────
        $av = $this->loadAttributeValues();

        // ── 1. Eco Watt Electric Water Heater ────────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Eco Watt Electric Water Heater',
            'sku'               => 'FEWH',
            'category_slug'     => 'water-heaters',
            'short_description' => 'Energy-efficient Eco Watt storage electric water heater with Incoloy 840 heating element, overheating protection, and full insulation. Available in Deluxe and Heavy Duty grades.',
            'description'       => "Fischer Eco Watt Electric Water Heater brings you advanced energy-saving technology for reliable hot water. Built with a premium Incoloy 840 heating element for long-lasting performance.\n\n**Key Features:**\n- Eco Watt energy-saving technology\n- Incoloy 840 corrosion-resistant element\n- Full thermal insulation\n- Overheating & pressure protection\n- Deluxe and Heavy Duty grades available\n- Available in 30, 40, 50 and 60 litre capacities\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => true,
            'price'             => 26000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0, // stock managed per variant
            'has_variants'      => true,
        ], [
            // Capacity listed first → displays first in the configurator (matches old fischerpk.com)
            'Geysers Storage Capacity' => ['30 Litr', '40 Litr', '50 Litr', '60 Litr'],
            'Model'                    => ['Deluxe', 'Heavy Duty'],
        ], [
            // [Geysers Storage Capacity, Model, price, compare_price, stock]
            // [CONFIRMED] prices from fischerpk.com — same price regardless of Model grade
            ['30 Litr', 'Deluxe',     26000, null, 15],
            ['30 Litr', 'Heavy Duty', 26000, null, 15],
            ['40 Litr', 'Deluxe',     28000, null, 12],
            ['40 Litr', 'Heavy Duty', 28000, null, 12],
            ['50 Litr', 'Deluxe',     31000, null, 10],
            ['50 Litr', 'Heavy Duty', 31000, null, 10],
            ['60 Litr', 'Deluxe',     33500, null,  8],
            ['60 Litr', 'Heavy Duty', 33500, null,  8],
        ], $av);

        // ── 2. Fischer FAST Electric Water Heater ────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer FAST Electric Water Heater',
            'sku'               => 'FAST',
            'category_slug'     => 'fast-electric-water-heaters',
            'short_description' => 'Fischer FAST electric water heater with single-welded tanks, adjustable wattage, and thermal safety cutout. Fast heating technology for rapid hot water delivery.',
            'description'       => "Fischer FAST Electric Water Heater is designed for rapid hot water delivery with premium single-welded tanks and adjustable wattage options.\n\n**Key Features:**\n- Single welded tanks for extra strength\n- Adjustable wattage control\n- Thermal safety cutout (auto shut-off)\n- Full thermal insulation\n- Incoloy 840 heating element\n- Deluxe and Heavy Duty grades\n- Capacities from F-30 to F-200\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => false,
            'price'             => 28000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
        ], [
            'Series'    => ['Deluxe', 'Heavy Duty'],
            'Capacity'  => ['F-30', 'F-40', 'F-50', 'F-60', 'F-80', 'F-100', 'F-120', 'F-150', 'F-200'],
        ], [
            // [Series, Capacity, price, compare_price, stock]
            // [ESTIMATED] — MRP = selling price for FAST series (no discount)
            ['Deluxe',     'F-30',  27000,  null,  12],
            ['Deluxe',     'F-40',  30000,  null,  10],
            ['Deluxe',     'F-50',  33000,  null,  8],
            ['Deluxe',     'F-60',  36000,  null,  7],
            ['Deluxe',     'F-80',  42000,  null,  6],
            ['Deluxe',     'F-100', 48000,  null,  5],
            ['Deluxe',     'F-120', 54000,  null,  4],
            ['Deluxe',     'F-150', 62000,  null,  3],
            ['Deluxe',     'F-200', 72000,  null,  3],
            ['Heavy Duty', 'F-30',  31000,  null,  12],
            ['Heavy Duty', 'F-40',  35000,  null,  10],
            ['Heavy Duty', 'F-50',  39000,  null,  8],
            ['Heavy Duty', 'F-60',  43000,  null,  7],
            ['Heavy Duty', 'F-80',  50000,  null,  6],
            ['Heavy Duty', 'F-100', 57000,  null,  5],
            ['Heavy Duty', 'F-120', 65000,  null,  4],
            ['Heavy Duty', 'F-150', 76000,  null,  3],
            ['Heavy Duty', 'F-200', 90000,  null,  3],
        ], $av);

        // ── 3. Fischer Hybrid Electric+Gas Geyser ─────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Hybrid Electric + Gas Water Heater',
            'sku'               => 'FHG',
            'category_slug'     => 'hybrid-geysers',
            'short_description' => 'Dual-fuel hybrid water heater with both electric and gas heating modes. Flexible wattage options and full safety protection for maximum energy savings.',
            'description'       => "Fischer Hybrid Water Heater gives you the flexibility of both electric and gas fuel sources, ensuring uninterrupted hot water at the lowest operating cost.\n\n**Key Features:**\n- Dual fuel: Electric & Gas modes\n- Selectable wattage (1500W / 2000W / 2500W)\n- Overheating & pressure protection\n- Incoloy 840 element\n- Full thermal insulation\n- Deluxe and Heavy Duty grades\n- Capacities: 15G to 100G\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => false,
            'price'             => 45000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
        ], [
            'Series'    => ['Deluxe', 'Heavy Duty'],
            'Capacity'  => ['15G', '25G', '35G', '55G', '65G', '100G'],
            'Wattage'   => ['1500W', '2000W', '2500W'],
        ], [
            // [Series, Capacity, Wattage, price, compare_price, stock]
            // [ESTIMATED] — update via admin dashboard
            ['Deluxe', '15G', '1500W', 42000, null, 5],
            ['Deluxe', '15G', '2000W', 44000, null, 5],
            ['Deluxe', '15G', '2500W', 46000, null, 5],
            ['Deluxe', '25G', '1500W', 48000, null, 5],
            ['Deluxe', '25G', '2000W', 50000, null, 5],
            ['Deluxe', '25G', '2500W', 52000, null, 5],
            ['Deluxe', '35G', '1500W', 55000, null, 4],
            ['Deluxe', '35G', '2000W', 57000, null, 4],
            ['Deluxe', '35G', '2500W', 59000, null, 4],
            ['Deluxe', '55G', '1500W', 64000, null, 3],
            ['Deluxe', '55G', '2000W', 66000, null, 3],
            ['Deluxe', '55G', '2500W', 68000, null, 3],
            ['Deluxe', '65G', '1500W', 72000, null, 3],
            ['Deluxe', '65G', '2000W', 74000, null, 3],
            ['Deluxe', '65G', '2500W', 76000, null, 3],
            ['Deluxe', '100G', '1500W', 95000, null, 2],
            ['Deluxe', '100G', '2000W', 97000, null, 2],
            ['Deluxe', '100G', '2500W', 99000, null, 2],
            ['Heavy Duty', '15G', '1500W', 47000, null, 5],
            ['Heavy Duty', '15G', '2000W', 49000, null, 5],
            ['Heavy Duty', '15G', '2500W', 51000, null, 5],
            ['Heavy Duty', '25G', '1500W', 54000, null, 5],
            ['Heavy Duty', '25G', '2000W', 56000, null, 5],
            ['Heavy Duty', '25G', '2500W', 58000, null, 5],
            ['Heavy Duty', '35G', '1500W', 62000, null, 4],
            ['Heavy Duty', '35G', '2000W', 64000, null, 4],
            ['Heavy Duty', '35G', '2500W', 66000, null, 4],
            ['Heavy Duty', '55G', '1500W', 72000, null, 3],
            ['Heavy Duty', '55G', '2000W', 74000, null, 3],
            ['Heavy Duty', '55G', '2500W', 76000, null, 3],
            ['Heavy Duty', '65G', '1500W', 80000, null, 3],
            ['Heavy Duty', '65G', '2000W', 82000, null, 3],
            ['Heavy Duty', '65G', '2500W', 84000, null, 3],
            ['Heavy Duty', '100G', '1500W', 108000, null, 2],
            ['Heavy Duty', '100G', '2000W', 110000, null, 2],
            ['Heavy Duty', '100G', '2500W', 112000, null, 2],
        ], $av, true); // 3-attr mode

        // ── 4. Fischer Gas Geyser ─────────────────────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Gas Water Heater (Storage)',
            'sku'               => 'FGWH',
            'category_slug'     => 'hybrid-geysers', // closest category
            'short_description' => 'Fischer gas storage water heater with overheating protection and full insulation. Available in Deluxe and Heavy Duty grades from 15G to 100G.',
            'description'       => "Fischer Gas Storage Water Heater is built for reliability and long service life. With heavy-gauge steel tanks and full insulation, you get consistent hot water throughout the day.\n\n**Key Features:**\n- Gas fuel — low running cost\n- Heavy-gauge single welded tanks\n- Overheating & pressure protection\n- Full thermal insulation\n- Deluxe and Heavy Duty grades\n- Capacities: 15G to 100G\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => false,
            'price'             => 31600,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
        ], [
            'Series'    => ['Deluxe', 'Heavy Duty'],
            'Capacity'  => ['15G', '25G', '35G', '55G', '65G', '100G'],
        ], [
            // [Series, Capacity, price, compare_price, stock]
            // [CONFIRMED] Deluxe range: 31.6K to 44K
            ['Deluxe', '15G',  31600, null, 8],
            ['Deluxe', '25G',  34000, null, 7],
            ['Deluxe', '35G',  36500, null, 6],
            ['Deluxe', '55G',  40000, null, 5],
            ['Deluxe', '65G',  42000, null, 4],
            ['Deluxe', '100G', 44000, null, 3],
            // [CONFIRMED] Heavy Duty range: 33.6K to 104K
            ['Heavy Duty', '15G',  33600, null,  8],
            ['Heavy Duty', '25G',  38000, null,  7],
            ['Heavy Duty', '35G',  45000, null,  6],
            ['Heavy Duty', '55G',  62000, null,  5],
            ['Heavy Duty', '65G',  80000, null,  4],
            ['Heavy Duty', '100G', 104000, null, 3],
        ], $av);

        // ── 5. Instant Gas Water Heater ───────────────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Instant Gas Water Heater',
            'sku'               => 'FWH',
            'category_slug'     => 'hybrid-geysers',
            'short_description' => 'Compact instant gas water heater with rapid heat-up time. Available in 6L, 8L, and 10L capacities.',
            'description'       => "Fischer Instant Gas Water Heater delivers hot water on demand with no wait time. Compact design makes it ideal for bathrooms and kitchens.\n\n**Key Features:**\n- Instant hot water on demand\n- Gas fuel — cost-efficient operation\n- Compact wall-mount design\n- Auto ignition\n- Overheating protection\n- Capacities: FWH-6L, FWH-8L, FWH-10L\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => true,
            'price'             => 17000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
        ], [
            'Capacity' => ['6L', '8L', '10L'],
        ], [
            // [Capacity, price, compare_price, stock]
            // [CONFIRMED]
            ['6L',  17000, null, 15],
            ['8L',  22500, null, 12],
            ['10L', 26000, null, 10],
        ], $av);

        // ── 6. FE Series Instant Storage Electric Water Heater ───────────
        $this->seedProduct([
            'name'              => 'Fischer FE Series Instant Storage Electric Water Heater',
            'sku'               => 'FE',
            'category_slug'     => 'instant-electric-water-heaters',
            'short_description' => 'FE Series instant-cum-storage electric water heater. Quick heating with wattage control. Available in Deluxe and Heavy Duty grades.',
            'description'       => "Fischer FE Series combines instant heating with storage capacity for a reliable hot water supply. Compact design with adjustable wattage for energy savings.\n\n**Key Features:**\n- Instant cum storage technology\n- Wattage control for energy savings\n- Overheating protection\n- Compact wall-mount design\n- Deluxe and Heavy Duty grades\n- FE-10, FE-15, FE-30 sizes\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => false,
            'price'             => 18000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
        ], [
            'Series'   => ['Deluxe', 'Heavy Duty'],
            'Capacity' => ['FE-10', 'FE-15', 'FE-30'],
        ], [
            // [Series, Capacity, price, compare_price, stock]
            // [ESTIMATED] — update via admin dashboard
            ['Deluxe',     'FE-10', 18000, null, 10],
            ['Deluxe',     'FE-15', 22000, null, 8],
            ['Deluxe',     'FE-30', 28000, null, 6],
            ['Heavy Duty', 'FE-10', 21000, null, 10],
            ['Heavy Duty', 'FE-15', 25000, null, 8],
            ['Heavy Duty', 'FE-30', 32000, null, 6],
        ], $av);

        $this->command->info("\n✓ Product Portfolio seeded successfully.");
        $this->command->info("  Note: Prices marked [ESTIMATED] should be verified and updated via Admin → Products.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Load all attribute values keyed by [attrName][value] → AttributeValue
     */
    private function loadAttributeValues(): array
    {
        $map = [];
        $attrs = Attribute::with('values')->get();
        foreach ($attrs as $attr) {
            foreach ($attr->values as $val) {
                $map[$attr->name][$val->value] = $val;
            }
        }
        return $map;
    }

    /**
     * Seed a product with its configurator variants.
     *
     * @param array $productData  Product fields
     * @param array $attrConfig   ['AttrName' => ['Value1', 'Value2', ...], ...]
     * @param array $variantRows  Rows: [Attr1Value, [Attr2Value,] [Attr3Value,] price, compare_price, stock]
     * @param array $av           AttributeValue map from loadAttributeValues()
     * @param bool  $threeAttrs   Whether variantRows have 3 attribute values (vs 1 or 2)
     */
    private function seedProduct(
        array $productData,
        array $attrConfig,
        array $variantRows,
        array $av,
        bool  $threeAttrs = false
    ): void {
        DB::transaction(function () use ($productData, $attrConfig, $variantRows, $av, $threeAttrs) {
            // ── Resolve category ─────────────────────────────────────────
            $category = Category::where('slug', $productData['category_slug'])->first();
            if (!$category) {
                $this->command->warn("  ⚠ Category '{$productData['category_slug']}' not found — skipping {$productData['name']}");
                return;
            }

            // ── Create/update product ────────────────────────────────────
            $slug = Str::slug($productData['name']);
            $slugExists = Product::where('slug', $slug)->exists();

            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                array_merge(
                    collect($productData)->except(['category_slug'])->toArray(),
                    [
                        'slug'               => $slug . ($slugExists ? '-' . Str::random(4) : ''),
                        'category_id'        => $category->id,
                        'stock_quantity'     => $productData['stock'] ?? 0,
                        'stock_status'       => $productData['stock_status'] ?? 'in_stock',
                        'is_active'          => true,
                    ]
                )
            );

            // ── Sync attributes to product ──────────────────────────────
            $attrIds = [];
            foreach (array_keys($attrConfig) as $attrName) {
                if (isset($av[$attrName])) {
                    $attrId = collect($av[$attrName])->first()?->attribute_id;
                    if ($attrId) $attrIds[] = $attrId;
                }
            }
            $product->attributes()->sync($attrIds);

            // ── Create variants ─────────────────────────────────────────
            foreach ($variantRows as $row) {
                $attrNames = array_keys($attrConfig);
                $numAttrs  = count($attrNames);

                // Parse row: [attr1val, [attr2val], [attr3val], price, compare_price, stock]
                if ($numAttrs === 1) {
                    [$cap, $price, $comparePrice, $stock] = $row;
                    $attrValueLabels = [$attrNames[0] => $cap];
                    $skuSuffix = strtolower(str_replace(['/', ' '], '-', $cap));
                } elseif ($numAttrs === 2) {
                    [$attr1, $attr2, $price, $comparePrice, $stock] = $row;
                    $attrValueLabels = [$attrNames[0] => $attr1, $attrNames[1] => $attr2];
                    $v1 = strtolower(str_replace(['/', ' '], '-', $attr1));
                    $v2 = strtolower(str_replace(['/', ' '], '-', $attr2));
                    $skuSuffix = "{$v1}-{$v2}";
                } else {
                    // 3 attributes
                    [$series, $cap, $wattage, $price, $comparePrice, $stock] = $row;
                    $attrValueLabels = [$attrNames[0] => $series, $attrNames[1] => $cap, $attrNames[2] => $wattage];
                    $seriesCode = $series === 'Heavy Duty' ? 'HD' : 'D';
                    $wattCode   = str_replace('W', '', $wattage);
                    $skuSuffix  = strtolower(str_replace(['/', ' '], '-', "{$cap}-{$seriesCode}-{$wattCode}w"));
                }

                $variantSku = $productData['sku'] . '-' . $skuSuffix;

                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $variantSku],
                    [
                        'product_id'     => $product->id,
                        'sku'            => $variantSku,
                        'price'          => $price,
                        'compare_price'  => $comparePrice,
                        'stock_quantity' => $stock,
                        'is_active'      => true,
                    ]
                );

                // Sync attribute values
                $attrValueIds = [];
                foreach ($attrValueLabels as $attrName => $valueName) {
                    if (isset($av[$attrName][$valueName])) {
                        $attrValueIds[] = $av[$attrName][$valueName]->id;
                    } else {
                        $this->command->warn("  ⚠ Attribute value not found: {$attrName} → {$valueName} (run AttributeSeeder first)");
                    }
                }
                $variant->attributeValues()->sync($attrValueIds);
            }

            // ── Update product base price from first active variant ──────
            $firstVariant = $product->variants()->where('is_active', true)->orderBy('price')->first();
            if ($firstVariant) {
                $product->update([
                    'price'         => $firstVariant->price,
                    'compare_price' => $firstVariant->compare_price,
                ]);
            }

            $variantCount = $product->variants()->count();
            $this->command->info("  ✓ {$product->name} → {$variantCount} variants");
        });
    }
}
