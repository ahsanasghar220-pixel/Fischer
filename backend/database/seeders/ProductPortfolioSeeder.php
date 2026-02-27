<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ProductPortfolioSeeder
 *
 * Seeds all 6 Fischer water heater product lines with their
 * Apple-style configurator variants.
 *
 * Attribute structure:
 *   - Eco Watt         → Geysers Storage Capacity (R-xx) × Model (Deluxe / Heavy Duty)
 *   - FAST             → Capacity (F-xx)           × Model (Deluxe / Heavy Duty)
 *   - Hybrid           → Capacity (gallon)          × Model (Deluxe / Heavy Duty)
 *   - Gas Geyser       → Capacity (gallon)          × Model (Deluxe / Heavy Duty)
 *   - Instant Gas      → Capacity (6L/8L/10L)       [no Model — 100% imported, one grade]
 *   - FE Instant Store → Capacity (FE-10/15/30)     [no Model — one grade]
 *
 * Pricing source: confirmed Fischer price list.
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
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => 'Energy-efficient Eco Watt storage electric water heater with Incoloy 840 heating element, overheating protection, and full insulation. Available in Deluxe and Heavy Duty grades from R-30 to R-80.',
            'description'       => "Fischer Eco Watt Electric Water Heater brings you advanced energy-saving technology for reliable hot water. Built with a premium Incoloy 840 heating element for long-lasting performance.\n\n**Key Features:**\n- Eco Watt energy-saving technology\n- Incoloy 840 corrosion-resistant element\n- Full thermal insulation\n- Overheating & pressure protection\n- Deluxe and Heavy Duty grades available\n- Available in R-30 to R-80 capacities\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => true,
            'price'             => 24000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/water-heaters/Eco Watt Series Electric Water Heater.webp',
            ],
        ], [
            // Capacity first → displays first in configurator
            'Geysers Storage Capacity' => ['R-30', 'R-40', 'R-50', 'R-60', 'R-80'],
            'Model'                    => ['Deluxe', 'Heavy Duty'],
        ], [
            // [Geysers Storage Capacity, Model, price, compare_price, stock]
            ['R-30', 'Deluxe',      24000, null, 15],
            ['R-30', 'Heavy Duty',  26000, null, 15],
            ['R-40', 'Deluxe',      26000, null, 12],
            ['R-40', 'Heavy Duty',  28000, null, 12],
            ['R-50', 'Deluxe',      28000, null, 10],
            ['R-50', 'Heavy Duty',  31000, null, 10],
            ['R-60', 'Deluxe',      30000, null,  8],
            ['R-60', 'Heavy Duty',  33500, null,  8],
            ['R-80', 'Deluxe',      36000, null,  6],
            ['R-80', 'Heavy Duty',  40000, null,  6],
        ], $av);

        // ── 2. Fischer FAST Electric Water Heater ────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer FAST Electric Water Heater',
            'sku'               => 'FAST',
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => 'Fischer FAST electric water heater with single-welded tanks, adjustable wattage, and thermal safety cutout. Fast heating technology for rapid hot water delivery.',
            'description'       => "Fischer FAST Electric Water Heater is designed for rapid hot water delivery with premium single-welded tanks and adjustable wattage options.\n\n**Key Features:**\n- Single welded tanks for extra strength\n- Adjustable wattage control\n- Thermal safety cutout (auto shut-off)\n- Full thermal insulation\n- Incoloy 840 heating element\n- Deluxe and Heavy Duty grades\n- Capacities from F-30 to F-200\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => false,
            'price'             => 21000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/fast-electric-water-heaters/Fischer Fast Electric Water Heater F-30 Liter.webp',
            ],
        ], [
            'Capacity' => ['F-30', 'F-40', 'F-50', 'F-60', 'F-80', 'F-100', 'F-140', 'F-200'],
            'Model'    => ['Deluxe', 'Heavy Duty'],
        ], [
            // [Capacity, Model, price, compare_price, stock]
            ['F-30',  'Deluxe',     21000, null, 12],
            ['F-30',  'Heavy Duty', 23500, null, 12],
            ['F-40',  'Deluxe',     22000, null, 10],
            ['F-40',  'Heavy Duty', 25000, null, 10],
            ['F-50',  'Deluxe',     23500, null,  8],
            ['F-50',  'Heavy Duty', 26500, null,  8],
            ['F-60',  'Deluxe',     24500, null,  7],
            ['F-60',  'Heavy Duty', 29000, null,  7],
            ['F-80',  'Deluxe',     28000, null,  6],
            ['F-80',  'Heavy Duty', 34000, null,  6],
            ['F-100', 'Deluxe',     40000, null,  5],
            ['F-100', 'Heavy Duty', 48000, null,  5],
            ['F-140', 'Deluxe',     46000, null,  4],
            ['F-140', 'Heavy Duty', 57000, null,  4],
            ['F-200', 'Deluxe',     54000, null,  3],
            ['F-200', 'Heavy Duty', 67000, null,  3],
        ], $av);

        // ── 3. Fischer Hybrid Electric + Gas Water Heater ─────────────────
        $this->seedProduct([
            'name'              => 'Fischer Hybrid Electric + Gas Water Heater',
            'sku'               => 'FHG',
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => 'Dual-fuel hybrid water heater operating on both electric and gas. Available in Deluxe and Heavy Duty grades from 15 to 100 gallons.',
            'description'       => "Fischer Hybrid Water Heater gives you the flexibility of both electric and gas fuel sources, ensuring uninterrupted hot water at the lowest operating cost.\n\n**Key Features:**\n- Dual fuel: Electric & Gas modes\n- Imported gas thermostat with auto ignition\n- Imported glass wool insulation\n- Italian electric element + thermostat\n- 9/10 inner tank\n- Overheating & pressure protection\n- Deluxe and Heavy Duty grades\n- Capacities: 15G to 100G\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => false,
            'price'             => 43500,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/hybrid-geysers/Fischer Hybrid (Electric Gas Geyser) 25 Gallon.webp',
            ],
        ], [
            'Capacity' => ['15G', '25G', '35G', '55G', '65G', '100G'],
            'Model'    => ['Deluxe', 'Heavy Duty'],
        ], [
            // [Capacity, Model, price, compare_price, stock]
            // 15G–55G: both Deluxe and Heavy Duty available
            ['15G',  'Deluxe',      43500,  null, 5],
            ['15G',  'Heavy Duty',  50500,  null, 5],
            ['25G',  'Deluxe',      48500,  null, 5],
            ['25G',  'Heavy Duty',  58000,  null, 5],
            ['35G',  'Deluxe',      55500,  null, 4],
            ['35G',  'Heavy Duty',  69000,  null, 4],
            ['55G',  'Deluxe',      64000,  null, 3],
            ['55G',  'Heavy Duty',  81000,  null, 3],
            // 65G and 100G: Heavy Duty only
            ['65G',  'Heavy Duty',  90000,  null, 3],
            ['100G', 'Heavy Duty', 150000,  null, 2],
        ], $av);

        // ── 4. Fischer Gas Water Heater (Storage) ─────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Gas Water Heater (Storage)',
            'sku'               => 'FGWH',
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => 'Fischer gas storage water heater with imported gas thermostat, auto ignition, and full insulation. Available in Deluxe and Heavy Duty grades from 15G to 100G.',
            'description'       => "Fischer Gas Storage Water Heater is built for reliability and long service life. With heavy-gauge steel tanks and full insulation, you get consistent hot water throughout the day.\n\n**Key Features:**\n- Gas fuel — low running cost\n- Imported gas thermostat with auto ignition\n- Imported glass wool insulation\n- 9/10 inner tank\n- Overheating & pressure protection\n- Deluxe and Heavy Duty grades\n- Capacities: 15G to 100G\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => false,
            'price'             => 39500,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/hybrid-geysers/Gas Geyser 35 Gallon.webp',
            ],
        ], [
            'Capacity' => ['15G', '25G', '35G', '55G', '65G', '100G'],
            'Model'    => ['Deluxe', 'Heavy Duty'],
        ], [
            // [Capacity, Model, price, compare_price, stock]
            // 15G–55G: both Deluxe and Heavy Duty available
            ['15G',  'Deluxe',      39500,  null, 8],
            ['15G',  'Heavy Duty',  42000,  null, 8],
            ['25G',  'Deluxe',      44000,  null, 7],
            ['25G',  'Heavy Duty',  53000,  null, 7],
            ['35G',  'Deluxe',      47500,  null, 6],
            ['35G',  'Heavy Duty',  61000,  null, 6],
            ['55G',  'Deluxe',      55000,  null, 5],
            ['55G',  'Heavy Duty',  72000,  null, 5],
            // 65G and 100G: Heavy Duty only
            ['65G',  'Heavy Duty',  78000,  null, 4],
            ['100G', 'Heavy Duty', 130000,  null, 3],
        ], $av);

        // ── 5. Instant Gas Water Heater ───────────────────────────────────
        $this->seedProduct([
            'name'              => 'Fischer Instant Gas Water Heater',
            'sku'               => 'FWH',
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => '100% imported instant gas water heater with white front panel, LED indicator, and heavy duty copper heat exchanger. Available in 6L, 8L, and 10L.',
            'description'       => "Fischer Instant Gas Water Heater delivers hot water on demand with no wait time. 100% imported components ensure superior reliability.\n\n**Key Features:**\n- Instant hot water on demand\n- Gas fuel — cost-efficient operation\n- White paint front panel with LED indicator\n- Heavy duty copper heat exchanger\n- Compact wall-mount design\n- Auto ignition\n- Overheating protection\n- Capacities: FWH-6L, FWH-8L, FWH-10L\n- 1 Year Warranty",
            'is_new'            => false,
            'is_bestseller'     => true,
            'price'             => 21250,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/hybrid-geysers/Instant Gas Water Heater.webp',
            ],
        ], [
            'Capacity' => ['6L', '8L', '10L'],
        ], [
            // [Capacity, price, compare_price, stock]
            ['6L',  21250, null, 15],
            ['8L',  28125, null, 12],
            ['10L', 32500, null, 10],
        ], $av);

        // ── 6. FE Series Instant Storage Electric Water Heater ───────────
        $this->seedProduct([
            'name'              => 'Fischer Instant Plus Storage Electric Water Heater',
            'sku'               => 'FE',
            'category_slug'     => 'geysers-water-heaters',
            'short_description' => 'Instant-cum-storage electric water heater with quick heating and wattage control. Available in 10, 15, and 30 litre capacities.',
            'description'       => "Fischer Instant Plus Storage Electric Water Heater combines instant heating with storage capacity for a reliable hot water supply. Compact design with wattage control for energy savings.\n\n**Key Features:**\n- Instant cum storage technology\n- Wattage control for energy savings\n- Overheating protection\n- Compact wall-mount design\n- FE-10, FE-15, FE-30 sizes\n- 1 Year Warranty",
            'is_new'            => true,
            'is_bestseller'     => false,
            'price'             => 17000,
            'compare_price'     => null,
            'stock_status'      => 'in_stock',
            'stock'             => 0,
            'has_variants'      => true,
            'images'            => [
                '/images/products/instant-electric-water-heaters/Instant Cum Storage Electric Water Heater – 10 Litr.webp',
            ],
        ], [
            'Capacity' => ['FE-10', 'FE-15', 'FE-30'],
        ], [
            // [Capacity, price, compare_price, stock]
            ['FE-10', 17000, null, 10],
            ['FE-15', 19000, null,  8],
            ['FE-30', 24000, null,  6],
        ], $av);

        $this->command->info("\n✓ Product Portfolio seeded successfully.");
        $this->command->info("  Prices are confirmed from the Fischer price list.");
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
     * @param array $variantRows  Rows: [Attr1Value, [Attr2Value,] price, compare_price, stock]
     * @param array $av           AttributeValue map from loadAttributeValues()
     */
    private function seedProduct(
        array $productData,
        array $attrConfig,
        array $variantRows,
        array $av
    ): void {
        DB::transaction(function () use ($productData, $attrConfig, $variantRows, $av) {
            // ── Resolve category ─────────────────────────────────────────
            $category = Category::where('slug', $productData['category_slug'])->first();
            if (!$category) {
                $this->command->warn("  ⚠ Category '{$productData['category_slug']}' not found — skipping {$productData['name']}");
                return;
            }

            // ── Create/update product ────────────────────────────────────
            $slug = Str::slug($productData['name']);
            $slugExists = Product::where('slug', $slug)->whereNotIn(
                'sku', [$productData['sku']]
            )->exists();

            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                array_merge(
                    collect($productData)->except(['category_slug', 'images', 'stock'])->toArray(),
                    [
                        'slug'               => $slug . ($slugExists ? '-' . Str::random(4) : ''),
                        'category_id'        => $category->id,
                        'stock_quantity'     => $productData['stock'] ?? 0,
                        'stock_status'       => $productData['stock_status'] ?? 'in_stock',
                        'is_active'          => true,
                    ]
                )
            );

            // ── Sync product images ──────────────────────────────────────
            if (!empty($productData['images'])) {
                $product->images()->delete();
                foreach ($productData['images'] as $i => $imagePath) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image'      => $imagePath,
                        'alt_text'   => $product->name,
                        'sort_order' => $i,
                        'is_primary' => $i === 0,
                    ]);
                }
            }

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

                // Parse row: [attr1val, [attr2val], price, compare_price, stock]
                if ($numAttrs === 1) {
                    [$cap, $price, $comparePrice, $stock] = $row;
                    $attrValueLabels = [$attrNames[0] => $cap];
                    $skuSuffix = strtolower(str_replace(['/', ' '], '-', $cap));
                } else {
                    // 2 attributes — both values included in SKU for uniqueness
                    [$attr1, $attr2, $price, $comparePrice, $stock] = $row;
                    $attrValueLabels = [$attrNames[0] => $attr1, $attrNames[1] => $attr2];
                    $v1 = strtolower(str_replace(['/', ' '], '-', $attr1));
                    $v2 = strtolower(str_replace(['/', ' '], '-', $attr2));
                    $skuSuffix = "{$v1}-{$v2}";
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

            // ── Update product base price from cheapest active variant ───
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
