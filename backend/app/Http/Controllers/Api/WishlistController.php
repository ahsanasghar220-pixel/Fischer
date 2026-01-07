<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $wishlist = Wishlist::with(['product.images', 'product.category'])
            ->where('user_id', $user->id)
            ->whereHas('product', function ($query) {
                $query->active();
            })
            ->orderByDesc('created_at')
            ->get();

        $products = $wishlist->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => $item->product,
                'added_at' => $item->created_at,
            ];
        });

        return $this->success($products);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();
        $result = Wishlist::toggle($user->id, $validated['product_id']);

        return $this->success([
            'in_wishlist' => $result['added'],
        ], $result['message']);
    }

    public function add(Request $request, int $productId)
    {
        $user = $request->user();
        $product = Product::active()->findOrFail($productId);

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return $this->success(['in_wishlist' => true], 'Product already in wishlist');
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $productId,
        ]);

        return $this->success(['in_wishlist' => true], 'Added to wishlist', 201);
    }

    public function remove(Request $request, int $productId)
    {
        $user = $request->user();

        Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return $this->success(['in_wishlist' => false], 'Removed from wishlist');
    }

    public function check(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        $user = $request->user();

        $inWishlist = Wishlist::where('user_id', $user->id)
            ->whereIn('product_id', $validated['product_ids'])
            ->pluck('product_id')
            ->toArray();

        return $this->success([
            'in_wishlist' => $inWishlist,
        ]);
    }

    public function moveToCart(Request $request, int $wishlistId)
    {
        $user = $request->user();

        $wishlistItem = Wishlist::where('user_id', $user->id)
            ->where('id', $wishlistId)
            ->firstOrFail();

        $product = $wishlistItem->product;

        if (!$product || !$product->is_active) {
            return $this->error('Product is no longer available', 400);
        }

        $cart = \App\Models\Cart::getOrCreate($user->id);
        $cart->addItem($product, 1);

        $wishlistItem->delete();

        return $this->success(null, 'Product moved to cart');
    }
}
