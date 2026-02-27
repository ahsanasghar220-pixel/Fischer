<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;

/**
 * AttributeSeeder
 *
 * Seeds the global product attributes and their values.
 * These attributes are shared across products and used
 * by the Apple-style product configurator.
 *
 * Run: php artisan db:seed --class=AttributeSeeder
 */
class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            // ── Series (product grade/tier) ─────────────────────────────────
            [
                'name' => 'Series',
                'type' => 'button',
                'values' => [
                    ['value' => 'Deluxe', 'sort_order' => 1],
                    ['value' => 'Heavy Duty', 'sort_order' => 2],
                ],
            ],

            // ── Capacity ────────────────────────────────────────────────────
            // Covers all water heater product lines
            [
                'name' => 'Capacity',
                'type' => 'button',
                'values' => [
                    // Eco Watt Electric
                    ['value' => 'R-30', 'sort_order' => 1],
                    ['value' => 'R-40', 'sort_order' => 2],
                    ['value' => 'R-50', 'sort_order' => 3],
                    ['value' => 'R-60', 'sort_order' => 4],
                    ['value' => 'R-80', 'sort_order' => 5],
                    // Fischer FAST Electric
                    ['value' => 'F-30', 'sort_order' => 6],
                    ['value' => 'F-40', 'sort_order' => 7],
                    ['value' => 'F-50', 'sort_order' => 8],
                    ['value' => 'F-60', 'sort_order' => 9],
                    ['value' => 'F-80', 'sort_order' => 10],
                    ['value' => 'F-100', 'sort_order' => 11],
                    ['value' => 'F-120', 'sort_order' => 12],
                    ['value' => 'F-150', 'sort_order' => 13],
                    ['value' => 'F-200', 'sort_order' => 14],
                    // Gas Geyser / Hybrid (gallons)
                    ['value' => '15G', 'sort_order' => 15],
                    ['value' => '25G', 'sort_order' => 16],
                    ['value' => '35G', 'sort_order' => 17],
                    ['value' => '55G', 'sort_order' => 18],
                    ['value' => '65G', 'sort_order' => 19],
                    ['value' => '100G', 'sort_order' => 20],
                    // Instant Gas Water Heater (litres)
                    ['value' => '6L', 'sort_order' => 21],
                    ['value' => '8L', 'sort_order' => 22],
                    ['value' => '10L', 'sort_order' => 23],
                    // FE Instant Storage Electric
                    ['value' => 'FE-10', 'sort_order' => 24],
                    ['value' => 'FE-15', 'sort_order' => 25],
                    ['value' => 'FE-30', 'sort_order' => 26],
                ],
            ],

            // ── Geysers Storage Capacity ────────────────────────────────────
            // Used for Eco Watt Electric Water Heater (litre-based, matches old site labels)
            [
                'name' => 'Geysers Storage Capacity',
                'type' => 'button',
                'values' => [
                    ['value' => '30 Litr', 'sort_order' => 1],
                    ['value' => '40 Litr', 'sort_order' => 2],
                    ['value' => '50 Litr', 'sort_order' => 3],
                    ['value' => '60 Litr', 'sort_order' => 4],
                ],
            ],

            // ── Model ────────────────────────────────────────────────────────
            // Product grade for Eco Watt (mirrors old site "Model" label)
            [
                'name' => 'Model',
                'type' => 'button',
                'values' => [
                    ['value' => 'Deluxe',     'sort_order' => 1],
                    ['value' => 'Heavy Duty', 'sort_order' => 2],
                ],
            ],

            // ── Wattage ─────────────────────────────────────────────────────
            // Used for Hybrid geyser and other adjustable-wattage products
            [
                'name' => 'Wattage',
                'type' => 'button',
                'values' => [
                    ['value' => '1000W', 'sort_order' => 1],
                    ['value' => '1500W', 'sort_order' => 2],
                    ['value' => '2000W', 'sort_order' => 3],
                    ['value' => '2500W', 'sort_order' => 4],
                    ['value' => '3000W', 'sort_order' => 5],
                    ['value' => '3500W', 'sort_order' => 6],
                    ['value' => '4000W', 'sort_order' => 7],
                ],
            ],
        ];

        foreach ($attributes as $attrData) {
            $values = $attrData['values'];
            unset($attrData['values']);

            $attribute = Attribute::updateOrCreate(
                ['name' => $attrData['name']],
                $attrData
            );

            foreach ($values as $valueData) {
                AttributeValue::updateOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $valueData['value']],
                    array_merge($valueData, ['attribute_id' => $attribute->id])
                );
            }

            $this->command->info("  ✓ Attribute: {$attribute->name} ({$attribute->values()->count()} values)");
        }

        $this->command->info("\nAttributes seeded successfully.");
    }
}
