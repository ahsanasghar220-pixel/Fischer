<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $status = $request->get('status');
        $search = $request->get('search');
        $perPage = 15;

        // Raw query with JOINs for maximum speed
        $query = DB::table('reviews')
            ->leftJoin('users', 'reviews.user_id', '=', 'users.id')
            ->leftJoin('products', 'reviews.product_id', '=', 'products.id')
            ->select([
                'reviews.id',
                'reviews.rating',
                'reviews.title',
                'reviews.content',
                'reviews.status',
                'reviews.created_at',
                'users.id as user_id',
                'users.first_name',
                'users.last_name',
                'users.email',
                'products.id as product_id',
                'products.name as product_name',
            ])
            ->whereNull('reviews.deleted_at');

        if ($status) {
            $query->where('reviews.status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.first_name', 'like', "%{$search}%")
                  ->orWhere('users.last_name', 'like', "%{$search}%")
                  ->orWhere('products.name', 'like', "%{$search}%")
                  ->orWhere('reviews.content', 'like', "%{$search}%");
            });
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $reviews = $query->orderByDesc('reviews.created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Transform
        $transformedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'rating' => (int) $review->rating,
                'title' => $review->title,
                'content' => $review->content,
                'status' => $review->status ?? 'pending',
                'created_at' => $review->created_at,
                'user' => $review->user_id ? [
                    'id' => $review->user_id,
                    'name' => trim(($review->first_name ?? '') . ' ' . ($review->last_name ?? '')),
                    'email' => $review->email,
                ] : null,
                'product' => $review->product_id ? [
                    'id' => $review->product_id,
                    'name' => $review->product_name,
                ] : null,
            ];
        });

        return $this->success([
            'data' => $transformedReviews,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }

    public function show($id)
    {
        $review = DB::table('reviews')
            ->leftJoin('users', 'reviews.user_id', '=', 'users.id')
            ->leftJoin('products', 'reviews.product_id', '=', 'products.id')
            ->select([
                'reviews.*',
                'users.first_name',
                'users.last_name',
                'users.email',
                'products.name as product_name',
            ])
            ->where('reviews.id', $id)
            ->whereNull('reviews.deleted_at')
            ->first();

        if (!$review) {
            return $this->error('Review not found', 404);
        }

        return $this->success(['data' => $review]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return $this->success(null, 'Review deleted successfully');
    }

    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->approve();

        return $this->success(['data' => $review->fresh()], 'Review approved successfully');
    }

    public function reject($id)
    {
        $review = Review::findOrFail($id);
        $review->reject();

        return $this->success(['data' => $review->fresh()], 'Review rejected successfully');
    }
}
