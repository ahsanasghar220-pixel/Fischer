<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|min:10|max:2000',
            'pros' => 'nullable|array',
            'pros.*' => 'string|max:255',
            'cons' => 'nullable|array',
            'cons.*' => 'string|max:255',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:2048',
        ]);

        $user = $request->user();

        // Check if user already reviewed this product
        $existingReview = Review::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingReview) {
            return $this->error('You have already reviewed this product', 400);
        }

        // Check if it's a verified purchase
        $isVerified = false;
        if ($validated['order_id']) {
            $order = Order::where('id', $validated['order_id'])
                ->where('user_id', $user->id)
                ->whereIn('status', ['delivered'])
                ->whereHas('items', function ($query) use ($validated) {
                    $query->where('product_id', $validated['product_id']);
                })
                ->exists();

            $isVerified = $order;
        } else {
            // Check if user has any delivered order with this product
            $isVerified = Order::where('user_id', $user->id)
                ->whereIn('status', ['delivered'])
                ->whereHas('items', function ($query) use ($validated) {
                    $query->where('product_id', $validated['product_id']);
                })
                ->exists();
        }

        $review = Review::create([
            'product_id' => $validated['product_id'],
            'user_id' => $user->id,
            'order_id' => $validated['order_id'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'pros' => $validated['pros'] ?? null,
            'cons' => $validated['cons'] ?? null,
            'is_verified_purchase' => $isVerified,
            'status' => 'pending',
        ]);

        // Handle images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $review->images()->create(['image' => $path]);
            }
        }

        return $this->success([
            'review' => $review->load('images'),
        ], 'Review submitted successfully. It will be visible after approval.', 201);
    }

    public function update(Request $request, int $reviewId)
    {
        $review = Review::where('id', $reviewId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($review->status === 'approved') {
            return $this->error('Approved reviews cannot be edited', 400);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'content' => 'sometimes|required|string|min:10|max:2000',
            'pros' => 'nullable|array',
            'cons' => 'nullable|array',
        ]);

        $review->update($validated);

        return $this->success([
            'review' => $review->fresh()->load('images'),
        ], 'Review updated successfully');
    }

    public function destroy(Request $request, int $reviewId)
    {
        $review = Review::where('id', $reviewId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $review->delete();

        return $this->success(null, 'Review deleted successfully');
    }

    public function markHelpful(Request $request, int $reviewId)
    {
        $review = Review::approved()->findOrFail($reviewId);

        $validated = $request->validate([
            'helpful' => 'required|boolean',
        ]);

        $review->markHelpful($request->user()->id, $validated['helpful']);

        return $this->success([
            'helpful_count' => $review->fresh()->helpful_count,
        ]);
    }

    public function userReviews(Request $request)
    {
        $reviews = Review::with(['product.images', 'images'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->paginated($reviews);
    }

    public function canReview(Request $request, int $productId)
    {
        $user = $request->user();

        // Check if already reviewed
        $hasReviewed = Review::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();

        if ($hasReviewed) {
            return $this->success([
                'can_review' => false,
                'reason' => 'already_reviewed',
            ]);
        }

        // Check if user has purchased and received the product
        $hasPurchased = Order::where('user_id', $user->id)
            ->whereIn('status', ['delivered'])
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        return $this->success([
            'can_review' => true,
            'is_verified_purchase' => $hasPurchased,
        ]);
    }
}
