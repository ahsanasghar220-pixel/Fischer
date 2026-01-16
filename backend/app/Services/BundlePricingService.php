<?php

namespace App\Services;

use App\Models\Bundle;
use App\Models\BundleSlot;
use App\Models\Product;
use Illuminate\Support\Collection;

class BundlePricingService
{
    /**
     * Calculate the original total price for a fixed bundle
     */
    public function calculateOriginalPrice(Bundle $bundle): float
    {
        if ($bundle->isFixed()) {
            return $this->calculateFixedBundleOriginalPrice($bundle);
        }

        return 0; // For configurable bundles, price depends on selections
    }

    /**
     * Calculate original price for a fixed bundle
     */
    protected function calculateFixedBundleOriginalPrice(Bundle $bundle): float
    {
        $total = 0;

        foreach ($bundle->items as $item) {
            $price = $item->price_override ?? $item->product?->price ?? 0;
            $total += $price * $item->quantity;
        }

        return round($total, 2);
    }

    /**
     * Calculate original price for a configurable bundle with selections
     */
    public function calculateConfigurableOriginalPrice(Bundle $bundle, array $selections): float
    {
        $total = 0;

        foreach ($selections as $selection) {
            $slotId = $selection['slot_id'];
            $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);

            $slot = $bundle->slots()->find($slotId);
            if (!$slot) {
                continue;
            }

            foreach ($productIds as $productId) {
                $slotProduct = $slot->products()->where('product_id', $productId)->first();
                if ($slotProduct) {
                    $price = $slotProduct->price_override ?? Product::find($productId)?->price ?? 0;
                    $total += $price;
                }
            }
        }

        return round($total, 2);
    }

    /**
     * Calculate the discounted price for a bundle
     */
    public function calculateDiscountedPrice(Bundle $bundle, ?array $selections = null): float
    {
        $originalPrice = $bundle->isFixed()
            ? $this->calculateOriginalPrice($bundle)
            : $this->calculateConfigurableOriginalPrice($bundle, $selections ?? []);

        if ($bundle->discount_type === 'fixed_price') {
            return round($bundle->discount_value, 2);
        }

        // Percentage discount
        $discountAmount = $originalPrice * ($bundle->discount_value / 100);
        return round(max(0, $originalPrice - $discountAmount), 2);
    }

    /**
     * Calculate savings amount
     */
    public function calculateSavings(Bundle $bundle, ?array $selections = null): float
    {
        $originalPrice = $bundle->isFixed()
            ? $this->calculateOriginalPrice($bundle)
            : $this->calculateConfigurableOriginalPrice($bundle, $selections ?? []);

        $discountedPrice = $this->calculateDiscountedPrice($bundle, $selections);

        return round(max(0, $originalPrice - $discountedPrice), 2);
    }

    /**
     * Calculate savings percentage
     */
    public function calculateSavingsPercentage(Bundle $bundle, ?array $selections = null): float
    {
        $originalPrice = $bundle->isFixed()
            ? $this->calculateOriginalPrice($bundle)
            : $this->calculateConfigurableOriginalPrice($bundle, $selections ?? []);

        if ($originalPrice <= 0) {
            return 0;
        }

        $savings = $this->calculateSavings($bundle, $selections);

        return round(($savings / $originalPrice) * 100, 2);
    }

    /**
     * Get complete pricing breakdown for a bundle
     */
    public function getPricingBreakdown(Bundle $bundle, ?array $selections = null): array
    {
        $originalPrice = $bundle->isFixed()
            ? $this->calculateOriginalPrice($bundle)
            : $this->calculateConfigurableOriginalPrice($bundle, $selections ?? []);

        $discountedPrice = $this->calculateDiscountedPrice($bundle, $selections);
        $savings = $this->calculateSavings($bundle, $selections);
        $savingsPercentage = $this->calculateSavingsPercentage($bundle, $selections);

        $items = [];

        if ($bundle->isFixed()) {
            foreach ($bundle->items as $item) {
                $price = $item->price_override ?? $item->product?->price ?? 0;
                $items[] = [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name,
                    'product_image' => $item->product?->primary_image,
                    'quantity' => $item->quantity,
                    'unit_price' => $price,
                    'line_total' => $price * $item->quantity,
                ];
            }
        } else {
            foreach ($selections ?? [] as $selection) {
                $slotId = $selection['slot_id'];
                $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);

                $slot = $bundle->slots()->find($slotId);
                if (!$slot) {
                    continue;
                }

                foreach ($productIds as $productId) {
                    $product = Product::find($productId);
                    $slotProduct = $slot->products()->where('product_id', $productId)->first();

                    if ($product && $slotProduct) {
                        $price = $slotProduct->price_override ?? $product->price ?? 0;
                        $items[] = [
                            'slot_id' => $slotId,
                            'slot_name' => $slot->name,
                            'product_id' => $productId,
                            'product_name' => $product->name,
                            'product_image' => $product->primary_image,
                            'quantity' => 1,
                            'unit_price' => $price,
                            'line_total' => $price,
                        ];
                    }
                }
            }
        }

        return [
            'original_price' => $originalPrice,
            'discounted_price' => $discountedPrice,
            'savings' => $savings,
            'savings_percentage' => $savingsPercentage,
            'discount_type' => $bundle->discount_type,
            'discount_value' => $bundle->discount_value,
            'items' => $items,
        ];
    }

    /**
     * Validate slot selections for a configurable bundle
     */
    public function validateSelections(Bundle $bundle, array $selections): array
    {
        $errors = [];

        if (!$bundle->isConfigurable()) {
            return $errors;
        }

        $requiredSlots = $bundle->slots()->where('is_required', true)->get();
        $selectionsBySlot = collect($selections)->keyBy('slot_id');

        // Check required slots
        foreach ($requiredSlots as $slot) {
            if (!$selectionsBySlot->has($slot->id)) {
                $errors[] = "Selection required for slot: {$slot->name}";
                continue;
            }

            $selection = $selectionsBySlot->get($slot->id);
            $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);
            $productIds = array_filter($productIds);

            if (count($productIds) < $slot->min_selections) {
                $errors[] = "At least {$slot->min_selections} selection(s) required for: {$slot->name}";
            }
        }

        // Validate all selections
        foreach ($selections as $selection) {
            $slotId = $selection['slot_id'];
            $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);
            $productIds = array_filter($productIds);

            $slot = $bundle->slots()->find($slotId);
            if (!$slot) {
                $errors[] = "Invalid slot ID: {$slotId}";
                continue;
            }

            if (count($productIds) > $slot->max_selections) {
                $errors[] = "Maximum {$slot->max_selections} selection(s) allowed for: {$slot->name}";
            }

            // Check if products are valid for this slot
            $validProductIds = $slot->products()->pluck('product_id')->toArray();
            foreach ($productIds as $productId) {
                if (!in_array($productId, $validProductIds)) {
                    $errors[] = "Invalid product selection for slot: {$slot->name}";
                }
            }
        }

        return $errors;
    }
}
