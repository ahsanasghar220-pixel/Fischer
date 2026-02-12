<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\RecentlyViewed;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images'])
            ->active();

        // Search
        if ($request->search) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->category) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $categoryIds = $category->getAllChildrenIds();
                $query->whereIn('category_id', $categoryIds);
            } else {
                // Invalid category slug - return empty results
                $query->whereRaw('1 = 0');
            }
        }

        // Brand filter
        if ($request->brand) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->brand);
            });
        }

        // Price range
        if ($request->min_price || $request->max_price) {
            $query->priceRange($request->min_price, $request->max_price);
        }

        // Stock status
        if ($request->in_stock) {
            $query->inStock();
        }

        // Featured
        if ($request->featured) {
            $query->featured();
        }

        // New arrivals
        if ($request->new) {
            $query->new();
        }

        // Bestsellers
        if ($request->bestseller) {
            $query->bestseller();
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', $sortOrder);
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'popularity':
                $query->orderByDesc('sales_count');
                break;
            case 'newest':
                $query->orderByDesc('created_at');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->per_page ?? 12, 50);
        $products = $query->paginate($perPage);

        return $this->paginated($products);
    }

    public function show(Request $request, string $slug)
    {
        $product = Product::with([
            'category',
            'brand',
            'images',
            'variants.attributeValues.attribute',
            'attributes.values',
            'approvedReviews' => function ($query) {
                $query->with('user:id,first_name,last_name,avatar')
                    ->latest()
                    ->limit(10);
            },
        ])
        ->where('slug', $slug)
        ->active()
        ->firstOrFail();

        // Track view
        $product->incrementViewCount();

        // Add to recently viewed
        $this->trackRecentlyViewed($request, $product->id);

        // Get related products
        $relatedProducts = $product->getRelatedProducts(4);

        return $this->success([
            'product' => $product,
            'related_products' => $relatedProducts,
        ]);
    }

    public function featured()
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->active()
            ->featured()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        return $this->success($products);
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->active()
            ->new()
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        return $this->success($products);
    }

    public function bestsellers()
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->active()
            ->bestseller()
            ->orderByDesc('sales_count')
            ->limit(8)
            ->get();

        return $this->success($products);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $products = Product::with(['images'])
            ->active()
            ->search($request->q)
            ->limit(10)
            ->get(['id', 'name', 'slug', 'price', 'compare_price']);

        return $this->success($products);
    }

    public function byCategory(string $slug, Request $request)
    {
        $category = Category::where('slug', $slug)->active()->firstOrFail();

        $categoryIds = $category->getAllChildrenIds();

        $query = Product::with(['category', 'brand', 'images'])
            ->active()
            ->whereIn('category_id', $categoryIds);

        // Apply filters
        if ($request->min_price || $request->max_price) {
            $query->priceRange($request->min_price, $request->max_price);
        }

        if ($request->in_stock) {
            $query->inStock();
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'created_at';
        match ($sortBy) {
            'price_low' => $query->orderBy('price', 'asc'),
            'price_high' => $query->orderBy('price', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            'rating' => $query->orderByDesc('average_rating'),
            'popularity' => $query->orderByDesc('sales_count'),
            default => $query->orderByDesc('created_at'),
        };

        $perPage = min($request->per_page ?? 12, 50);
        $products = $query->paginate($perPage);

        return $this->paginated($products);
    }

    public function reviews(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $reviews = $product->approvedReviews()
            ->with(['user:id,first_name,last_name,avatar', 'images'])
            ->orderByDesc('created_at')
            ->paginate(10);

        $stats = [
            'average_rating' => $product->average_rating,
            'review_count' => $product->review_count,
            'rating_distribution' => $this->getRatingDistribution($product),
        ];

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'stats' => $stats,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    protected function getRatingDistribution(Product $product): array
    {
        $total = $product->review_count ?: 1;

        // Single query to get all rating counts instead of N+1 queries
        $counts = $product->approvedReviews()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $count = $counts[$i] ?? 0;
            $distribution[$i] = [
                'count' => $count,
                'percentage' => round(($count / $total) * 100),
            ];
        }

        return $distribution;
    }

    protected function trackRecentlyViewed(Request $request, int $productId): void
    {
        $userId = auth()->id();
        $sessionId = $request->session_id;

        if (!$userId && !$sessionId) {
            return;
        }

        RecentlyViewed::updateOrCreate(
            [
                'user_id' => $userId,
                'session_id' => $userId ? null : $sessionId,
                'product_id' => $productId,
            ],
            ['updated_at' => now()]
        );

        // Keep only last 20 items
        $query = RecentlyViewed::where(function ($q) use ($userId, $sessionId) {
            if ($userId) {
                $q->where('user_id', $userId);
            } else {
                $q->where('session_id', $sessionId);
            }
        })
        ->orderByDesc('updated_at')
        ->skip(20)
        ->take(100);

        RecentlyViewed::whereIn('id', $query->pluck('id'))->delete();
    }

    public function recentlyViewed(Request $request)
    {
        $userId = auth()->id();
        $sessionId = $request->session_id;

        $query = RecentlyViewed::with('product.images')
            ->whereHas('product', function ($q) {
                $q->active();
            });

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return $this->success([]);
        }

        $products = $query->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->pluck('product');

        return $this->success($products);
    }
}
