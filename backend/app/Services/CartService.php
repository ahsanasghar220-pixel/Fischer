<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartService
{
    /**
     * Get the cart for the current user or session.
     * Returns null if no cart exists.
     *
     * Uses the default auth guard. For sanctum-specific lookups
     * (e.g. CheckoutController) see getCartForCheckout().
     */
    public function getCart(Request $request): ?Cart
    {
        $userId = auth()->id();
        $sessionId = $request->header('X-Session-ID') ?? $request->session_id;

        if ($userId) {
            return Cart::where('user_id', $userId)->first();
        }

        if ($sessionId) {
            return Cart::where('session_id', $sessionId)->first();
        }

        return null;
    }

    /**
     * Get or create a cart for the current user or session.
     * Creates a new session ID if none is provided for guests.
     *
     * Uses the default auth guard.
     */
    public function getOrCreateCart(Request $request): Cart
    {
        $userId = auth()->id();
        $sessionId = $request->header('X-Session-ID') ?? $request->session_id;

        if ($userId) {
            return Cart::getOrCreate($userId);
        }

        if (!$sessionId) {
            $sessionId = uniqid('cart_', true);
        }

        return Cart::getOrCreate(null, $sessionId);
    }

    /**
     * Get the cart for the current user or session during checkout.
     *
     * Uses the sanctum guard and applies a fallback: if the user's cart is
     * empty but a session cart with items exists, the session cart is returned.
     * This matches the behaviour previously inside CheckoutController::getCart().
     */
    public function getCartForCheckout(Request $request): ?Cart
    {
        $userId = auth('sanctum')->id();
        $sessionId = $request->header('X-Session-ID') ?? $request->session_id;

        if ($userId) {
            $userCart = Cart::with(['items.product', 'items.productVariant'])
                ->where('user_id', $userId)
                ->first();

            // If user cart exists and has items, use it
            if ($userCart && $userCart->items->isNotEmpty()) {
                return $userCart;
            }

            // If user cart is empty but session cart exists with items, fall back
            if ($sessionId) {
                $sessionCart = Cart::with(['items.product', 'items.productVariant'])
                    ->where('session_id', $sessionId)
                    ->first();

                if ($sessionCart && $sessionCart->items->isNotEmpty()) {
                    return $sessionCart;
                }
            }

            return $userCart; // Return user cart even if empty
        }

        if ($sessionId) {
            return Cart::with(['items.product', 'items.productVariant'])
                ->where('session_id', $sessionId)
                ->first();
        }

        return null;
    }

    /**
     * Get or create a cart, merging any existing session cart into the user cart
     * when the user is authenticated. Used by bundle add-to-cart.
     */
    public function getOrCreateCartWithMerge(Request $request): Cart
    {
        $userId = auth()->id();
        $sessionId = $request->header('X-Session-ID') ?? $request->session_id ?? session()->getId();

        if ($userId) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);

            // Merge session cart if exists
            if ($sessionId) {
                $sessionCart = Cart::where('session_id', $sessionId)
                    ->whereNull('user_id')
                    ->first();

                if ($sessionCart) {
                    foreach ($sessionCart->items as $item) {
                        $existingItem = $cart->items()
                            ->where('product_id', $item->product_id)
                            ->where('product_variant_id', $item->product_variant_id)
                            ->whereNull('bundle_id')
                            ->first();

                        if ($existingItem) {
                            $existingItem->increment('quantity', $item->quantity);
                        } else {
                            $item->update(['cart_id' => $cart->id]);
                        }
                    }
                    $sessionCart->delete();
                }
            }
        } else {
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }

        return $cart;
    }

    /**
     * Format a cart model into a response array.
     */
    public function formatCart(Cart $cart): array
    {
        $items = $cart->items->map(function ($item) {
            return [
                'id'         => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->product_variant_id,
                'product'    => [
                    'id'             => $item->product->id,
                    'name'           => $item->product->name,
                    'slug'           => $item->product->slug,
                    'sku'            => $item->product->sku,
                    'image'          => $item->product->primary_image,
                    'primary_image'  => $item->product->primary_image,
                    'price'          => $item->product->price,
                    'stock_quantity' => $item->product_variant_id
                        ? $item->productVariant->stock_quantity
                        : $item->product->stock_quantity,
                    'track_inventory' => $item->product->track_inventory,
                ],
                'variant'     => $item->productVariant ? [
                    'id'         => $item->productVariant->id,
                    'sku'        => $item->productVariant->sku,
                    'name'       => $item->productVariant->name ?? $item->variant_info,
                    'price'      => $item->productVariant->price,
                    'attributes' => $item->variant_info,
                ] : null,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'total_price' => $item->total_price,
                'is_available' => $item->is_available,
            ];
        });

        $subtotal = $cart->subtotal;
        $discount = $cart->getDiscount();

        return [
            'items'        => $items,
            'subtotal'     => round($subtotal, 2),
            'discount'     => round($discount, 2),
            'coupon_code'  => $cart->coupon_code,
            'total'        => round($subtotal - $discount, 2),
            'items_count'  => $cart->items_count,
            'total_weight' => $cart->total_weight,
        ];
    }
}
