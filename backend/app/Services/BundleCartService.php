<?php

namespace App\Services;

use App\Models\Bundle;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class BundleCartService
{
    protected BundlePricingService $pricingService;

    public function __construct(BundlePricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Add a bundle to the cart
     */
    public function addBundleToCart(Cart $cart, Bundle $bundle, ?array $selections = null): array
    {
        // Validate bundle availability
        if (!$bundle->is_available) {
            return [
                'success' => false,
                'message' => 'This bundle is not currently available.',
            ];
        }

        // Validate selections for configurable bundles
        if ($bundle->isConfigurable()) {
            if (empty($selections)) {
                return [
                    'success' => false,
                    'message' => 'Selections are required for this bundle.',
                ];
            }

            $validationErrors = $this->pricingService->validateSelections($bundle, $selections);
            if (!empty($validationErrors)) {
                return [
                    'success' => false,
                    'message' => 'Invalid selections.',
                    'errors' => $validationErrors,
                ];
            }
        }

        // Validate stock status of all bundle products
        $stockValidation = $this->validateBundleProductsStock($bundle, $selections);
        if (!$stockValidation['success']) {
            return $stockValidation;
        }

        return DB::transaction(function () use ($cart, $bundle, $selections) {
            switch ($bundle->cart_display) {
                case 'single_item':
                    return $this->addAsSingleItem($cart, $bundle, $selections);
                case 'grouped':
                    return $this->addAsGrouped($cart, $bundle, $selections);
                case 'individual':
                    return $this->addAsIndividual($cart, $bundle, $selections);
                default:
                    return $this->addAsGrouped($cart, $bundle, $selections);
            }
        });
    }

    /**
     * Add bundle as a single cart item
     */
    protected function addAsSingleItem(Cart $cart, Bundle $bundle, ?array $selections): array
    {
        // Check if bundle already in cart
        $existingItem = $cart->items()
            ->where('bundle_id', $bundle->id)
            ->where('is_bundle_item', false)
            ->whereNull('parent_cart_item_id')
            ->first();

        if ($existingItem) {
            // For single_item mode, we don't increment - return existing
            return [
                'success' => true,
                'message' => 'Bundle already in cart.',
                'cart_item' => $existingItem,
            ];
        }

        // Get the first product from the bundle for the cart item reference
        $primaryProduct = $bundle->isFixed()
            ? $bundle->items()->first()?->product
            : null;

        $cartItem = $cart->items()->create([
            'product_id' => $primaryProduct?->id ?? $bundle->products()->first()?->id,
            'bundle_id' => $bundle->id,
            'bundle_slot_selections' => $bundle->isConfigurable() ? $selections : null,
            'is_bundle_item' => false,
            'quantity' => 1,
        ]);

        // Update bundle analytics
        $bundle->incrementAddToCartCount();

        return [
            'success' => true,
            'message' => 'Bundle added to cart.',
            'cart_item' => $cartItem,
        ];
    }

    /**
     * Add bundle as grouped items with a parent
     */
    protected function addAsGrouped(Cart $cart, Bundle $bundle, ?array $selections): array
    {
        // Check if bundle already in cart
        $existingItem = $cart->items()
            ->where('bundle_id', $bundle->id)
            ->where('is_bundle_item', false)
            ->whereNull('parent_cart_item_id')
            ->first();

        if ($existingItem) {
            return [
                'success' => true,
                'message' => 'Bundle already in cart.',
                'cart_item' => $existingItem,
            ];
        }

        // Create parent bundle item
        $primaryProduct = $bundle->isFixed()
            ? $bundle->items()->first()?->product
            : null;

        $parentItem = $cart->items()->create([
            'product_id' => $primaryProduct?->id,
            'bundle_id' => $bundle->id,
            'bundle_slot_selections' => $bundle->isConfigurable() ? $selections : null,
            'is_bundle_item' => false,
            'quantity' => 1,
        ]);

        // Create child items
        if ($bundle->isFixed()) {
            foreach ($bundle->items as $bundleItem) {
                $cart->items()->create([
                    'product_id' => $bundleItem->product_id,
                    'bundle_id' => $bundle->id,
                    'is_bundle_item' => true,
                    'parent_cart_item_id' => $parentItem->id,
                    'quantity' => $bundleItem->quantity,
                ]);
            }
        } else {
            foreach ($selections as $selection) {
                $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);
                foreach (array_filter($productIds) as $productId) {
                    $cart->items()->create([
                        'product_id' => $productId,
                        'bundle_id' => $bundle->id,
                        'is_bundle_item' => true,
                        'parent_cart_item_id' => $parentItem->id,
                        'quantity' => 1,
                    ]);
                }
            }
        }

        // Update bundle analytics
        $bundle->incrementAddToCartCount();

        return [
            'success' => true,
            'message' => 'Bundle added to cart.',
            'cart_item' => $parentItem,
        ];
    }

    /**
     * Add bundle products as individual items
     */
    protected function addAsIndividual(Cart $cart, Bundle $bundle, ?array $selections): array
    {
        $addedItems = [];

        if ($bundle->isFixed()) {
            foreach ($bundle->items as $bundleItem) {
                $existingItem = $cart->items()
                    ->where('product_id', $bundleItem->product_id)
                    ->whereNull('bundle_id')
                    ->first();

                if ($existingItem) {
                    $existingItem->increment('quantity', $bundleItem->quantity);
                    $addedItems[] = $existingItem;
                } else {
                    $addedItems[] = $cart->items()->create([
                        'product_id' => $bundleItem->product_id,
                        'bundle_id' => $bundle->id,
                        'is_bundle_item' => true,
                        'quantity' => $bundleItem->quantity,
                    ]);
                }
            }
        } else {
            foreach ($selections as $selection) {
                $productIds = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);
                foreach (array_filter($productIds) as $productId) {
                    $existingItem = $cart->items()
                        ->where('product_id', $productId)
                        ->whereNull('bundle_id')
                        ->first();

                    if ($existingItem) {
                        $existingItem->increment('quantity');
                        $addedItems[] = $existingItem;
                    } else {
                        $addedItems[] = $cart->items()->create([
                            'product_id' => $productId,
                            'bundle_id' => $bundle->id,
                            'is_bundle_item' => true,
                            'quantity' => 1,
                        ]);
                    }
                }
            }
        }

        // Update bundle analytics
        $bundle->incrementAddToCartCount();

        return [
            'success' => true,
            'message' => 'Bundle products added to cart.',
            'cart_items' => $addedItems,
        ];
    }

    /**
     * Remove a bundle from the cart
     */
    public function removeBundleFromCart(Cart $cart, int $bundleId): bool
    {
        // Remove all items associated with this bundle
        $cart->items()
            ->where('bundle_id', $bundleId)
            ->delete();

        return true;
    }

    /**
     * Validate that all products in a bundle are in stock before adding to cart
     */
    protected function validateBundleProductsStock(Bundle $bundle, ?array $selections = null): array
    {
        $outOfStockProducts = [];

        if ($bundle->isFixed()) {
            // Load items with products for fixed bundles
            $bundle->loadMissing('items.product');

            foreach ($bundle->items as $item) {
                if ($item->product && $item->product->stock_status === 'out_of_stock') {
                    $outOfStockProducts[] = $item->product->name;
                }
            }
        } elseif ($bundle->isConfigurable() && !empty($selections)) {
            // For configurable bundles, check the selected products
            $productIds = [];
            foreach ($selections as $selection) {
                $ids = (array) ($selection['product_ids'] ?? [$selection['product_id'] ?? null]);
                $productIds = array_merge($productIds, array_filter($ids));
            }

            if (!empty($productIds)) {
                $products = Product::whereIn('id', $productIds)
                    ->where('stock_status', 'out_of_stock')
                    ->get();

                foreach ($products as $product) {
                    $outOfStockProducts[] = $product->name;
                }
            }
        }

        if (!empty($outOfStockProducts)) {
            $productList = implode(', ', $outOfStockProducts);
            return [
                'success' => false,
                'message' => "Cannot add bundle to cart: [{$productList}] " . (count($outOfStockProducts) === 1 ? 'is' : 'are') . " out of stock",
            ];
        }

        return ['success' => true];
    }

    /**
     * Calculate the total bundle discount for cart
     */
    public function calculateCartBundleDiscount(Cart $cart): float
    {
        $totalDiscount = 0;

        $bundleItems = $cart->items()
            ->whereNotNull('bundle_id')
            ->where('is_bundle_item', false)
            ->with('bundle')
            ->get();

        foreach ($bundleItems as $item) {
            if (!$item->bundle) {
                continue;
            }

            $selections = $item->bundle_slot_selections;
            $originalPrice = $item->bundle->isFixed()
                ? $this->pricingService->calculateOriginalPrice($item->bundle)
                : $this->pricingService->calculateConfigurableOriginalPrice($item->bundle, $selections ?? []);

            $discountedPrice = $this->pricingService->calculateDiscountedPrice($item->bundle, $selections);

            $totalDiscount += ($originalPrice - $discountedPrice) * $item->quantity;
        }

        return round($totalDiscount, 2);
    }
}
