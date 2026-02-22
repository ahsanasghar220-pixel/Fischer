<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Http\Requests\AddToCartRequest;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request)
    {
        $cart = $this->cartService->getCart($request);

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

        return $this->success($this->cartService->formatCart($cart));
    }

    public function add(AddToCartRequest $request)
    {
        $validated = $request->validated();

        return \DB::transaction(function () use ($request, $validated) {
            // Lock product/variant to prevent race conditions
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);

            if (!$product->is_active) {
                return $this->error('This product is not available', 400);
            }

            $variant = null;
            if ($validated['variant_id']) {
                $variant = ProductVariant::lockForUpdate()->find($validated['variant_id']);
                if (!$variant || !$variant->is_active || $variant->product_id !== $product->id) {
                    return $this->error('Invalid product variant', 400);
                }
            }

            $cart = $this->cartService->getOrCreateCart($request);

            // Check existing cart quantity for this product/variant
            $existingCartItem = $cart->items()
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variant?->id)
                ->first();

            $existingQuantity = $existingCartItem ? $existingCartItem->quantity : 0;
            $newTotalQuantity = $existingQuantity + $validated['quantity'];

            // Check stock availability (including existing cart items)
            $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;
            if ($product->track_inventory && !$product->allow_backorders && $newTotalQuantity > $availableStock) {
                return $this->error("Only {$availableStock} items available in stock (you have {$existingQuantity} in cart)", 400);
            }

            $item = $cart->addItem($product, $validated['quantity'], $variant);

            $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

            return $this->success($this->cartService->formatCart($cart), 'Item added to cart');
        });
    }

    public function update(Request $request, int $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0|max:100',
        ]);

        return \DB::transaction(function () use ($request, $itemId, $validated) {
            $cart = $this->cartService->getCart($request);

            if (!$cart) {
                return $this->error('Cart not found', 404);
            }

            $item = $cart->items()->find($itemId);

            if (!$item) {
                return $this->error('Item not found in cart', 404);
            }

            // Lock product/variant to prevent race conditions
            if ($item->product_variant_id) {
                $variant = ProductVariant::lockForUpdate()->find($item->product_variant_id);
                $product = $item->product;
                $availableStock = $variant ? $variant->stock_quantity : 0;
            } else {
                $product = Product::lockForUpdate()->find($item->product_id);
                $availableStock = $product->stock_quantity;
            }

            // Check stock availability
            if ($product->track_inventory && !$product->allow_backorders && $validated['quantity'] > $availableStock) {
                return $this->error("Only {$availableStock} items available in stock", 400);
            }

            $cart->updateItemQuantity($itemId, $validated['quantity']);

            $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

            return $this->success($this->cartService->formatCart($cart), 'Cart updated');
        });
    }

    public function remove(Request $request, int $itemId)
    {
        $cart = $this->cartService->getCart($request);

        if (!$cart) {
            return $this->error('Cart not found', 404);
        }

        if (!$cart->removeItem($itemId)) {
            return $this->error('Item not found in cart', 404);
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->cartService->formatCart($cart), 'Item removed from cart');
    }

    public function clear(Request $request)
    {
        $cart = $this->cartService->getCart($request);

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

        $cart = $this->cartService->getCart($request);

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Your cart is empty', 400);
        }

        $result = $cart->applyCoupon($validated['code']);

        if (!$result['success']) {
            return $this->error($result['message'], 400);
        }

        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->cartService->formatCart($cart), $result['message']);
    }

    public function removeCoupon(Request $request)
    {
        $cart = $this->cartService->getCart($request);

        if (!$cart) {
            return $this->success(null, 'No cart found');
        }

        $cart->removeCoupon();
        $cart->load(['items.product.images', 'items.productVariant.attributeValues.attribute']);

        return $this->success($this->cartService->formatCart($cart), 'Coupon removed');
    }
}
