<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $this->getCart($request);

        if (!$cart) {
            return $this->success([
                'items' => [],
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'items_count' => 0,
            ]);
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart));
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active) {
            return $this->error('This product is not available', 400);
        }

        $variant = null;
        if ($validated['variant_id']) {
            $variant = ProductVariant::find($validated['variant_id']);
            if (!$variant || !$variant->is_active || $variant->product_id !== $product->id) {
                return $this->error('Invalid product variant', 400);
            }
        }

        // Check stock
        $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;
        if ($product->track_inventory && !$product->allow_backorders && $validated['quantity'] > $availableStock) {
            return $this->error("Only {$availableStock} items available in stock", 400);
        }

        $cart = $this->getOrCreateCart($request);
        $item = $cart->addItem($product, $validated['quantity'], $variant);

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart), 'Item added to cart');
    }

    public function update(Request $request, int $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0|max:100',
        ]);

        $cart = $this->getCart($request);

        if (!$cart) {
            return $this->error('Cart not found', 404);
        }

        $item = $cart->items()->find($itemId);

        if (!$item) {
            return $this->error('Item not found in cart', 404);
        }

        // Check stock
        $product = $item->product;
        $variant = $item->productVariant;
        $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;

        if ($product->track_inventory && !$product->allow_backorders && $validated['quantity'] > $availableStock) {
            return $this->error("Only {$availableStock} items available in stock", 400);
        }

        $cart->updateItemQuantity($itemId, $validated['quantity']);

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart), 'Cart updated');
    }

    public function remove(Request $request, int $itemId)
    {
        $cart = $this->getCart($request);

        if (!$cart) {
            return $this->error('Cart not found', 404);
        }

        if (!$cart->removeItem($itemId)) {
            return $this->error('Item not found in cart', 404);
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart), 'Item removed from cart');
    }

    public function clear(Request $request)
    {
        $cart = $this->getCart($request);

        if ($cart) {
            $cart->clear();
        }

        return $this->success([
            'items' => [],
            'subtotal' => 0,
            'discount' => 0,
            'total' => 0,
            'items_count' => 0,
        ], 'Cart cleared');
    }

    public function applyCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $cart = $this->getCart($request);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty', 400);
        }

        $result = $cart->applyCoupon($validated['code']);

        if (!$result['success']) {
            return $this->error($result['message'], 400);
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart), $result['message']);
    }

    public function removeCoupon(Request $request)
    {
        $cart = $this->getCart($request);

        if ($cart) {
            $cart->removeCoupon();
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->formatCart($cart), 'Coupon removed');
    }

    protected function getCart(Request $request): ?Cart
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

    protected function getOrCreateCart(Request $request): Cart
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

    protected function formatCart(Cart $cart): array
    {
        $items = $cart->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->product_variant_id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'sku' => $item->product->sku,
                    'image' => $item->product->primary_image,
                    'stock_quantity' => $item->product_variant_id
                        ? $item->productVariant->stock_quantity
                        : $item->product->stock_quantity,
                    'track_inventory' => $item->product->track_inventory,
                ],
                'variant' => $item->productVariant ? [
                    'id' => $item->productVariant->id,
                    'sku' => $item->productVariant->sku,
                    'attributes' => $item->variant_info,
                ] : null,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
                'is_available' => $item->is_available,
            ];
        });

        $subtotal = $cart->subtotal;
        $discount = $cart->getDiscount();

        return [
            'items' => $items,
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'coupon_code' => $cart->coupon_code,
            'total' => round($subtotal - $discount, 2),
            'items_count' => $cart->items_count,
            'total_weight' => $cart->total_weight,
        ];
    }
}
