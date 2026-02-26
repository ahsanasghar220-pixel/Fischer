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

        // Always push out-of-stock products to the end
        $query->orderByRaw("CASE WHEN stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC");

        // Sorting
        $sort = $request->sort ?? $request->sort_by ?? 'latest';

        switch ($sort) {
            case 'price_asc':
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'name':
                $query->orderBy('name', $request->sort_order ?? 'asc');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'bestseller':
            case 'popularity':
                $query->orderByDesc('sales_count');
                break;
            case 'latest':
            case 'newest':
            default:
                $query->orderByDesc('created_at');
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

        // Build Apple-style configurator data if product has attribute-based variants
        $configurator = null;
        if ($product->has_variants && $product->variants->isNotEmpty()) {
            $hasAttributes = $product->variants->some(fn($v) => $v->attributeValues->isNotEmpty());

            if ($hasAttributes) {
                $configuratorAttributes = $product->attributes->map(function ($attr) use ($product) {
                    $usedValueIds = $product->variants
                        ->flatMap(fn($v) => $v->attributeValues->where('attribute_id', $attr->id))
                        ->pluck('id')
                        ->unique();

                    $values = $attr->values
                        ->filter(fn($v) => $usedValueIds->contains($v->id))
                        ->map(fn($v) => [
                            'id'         => $v->id,
                            'value'      => $v->value,
                            'color_code' => $v->color_code,
                        ])->values();

                    return ['id' => $attr->id, 'name' => $attr->name, 'type' => $attr->type ?? 'button', 'values' => $values];
                })->filter(fn($a) => count($a['values']) > 0)->values();

                $variantMap = [];
                foreach ($product->variants->where('is_active', true) as $variant) {
                    if ($variant->attributeValues->isNotEmpty()) {
                        $key = $variant->attributeValues->pluck('id')->sort()->values()->implode(',');
                        $variantMap[$key] = [
                            'id'            => $variant->id,
                            'price'         => (float) ($variant->price ?? $product->price),
                            'compare_price' => $variant->compare_price ? (float) $variant->compare_price : null,
                            'sku'           => $variant->sku,
                            'stock'         => $variant->stock_quantity,
                            'image'         => $variant->image,
                        ];
                    }
                }

                if (!empty($variantMap)) {
                    $configurator = [
                        'attributes'  => $configuratorAttributes,
                        'variant_map' => $variantMap,
                    ];
                }
            }
        }

        return $this->success([
            'product'          => $product,
            'related_products' => $relatedProducts,
            'configurator'     => $configurator,
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

        // Always push out-of-stock products to the end
        $query->orderByRaw("CASE WHEN stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC");

        // Sorting
        $sort = $request->sort ?? $request->sort_by ?? 'latest';
        match ($sort) {
            'price_asc', 'price_low' => $query->orderBy('price', 'asc'),
            'price_desc', 'price_high' => $query->orderBy('price', 'desc'),
            'name_asc', 'name' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'rating' => $query->orderByDesc('average_rating'),
            'bestseller', 'popularity' => $query->orderByDesc('sales_count'),
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

        // Cache rating distribution for 1 hour - changes infrequently
        $cacheKey = "product_{$product->id}_rating_distribution";
        $ratingDistribution = Cache::remember($cacheKey, 3600, function () use ($product) {
            return $this->getRatingDistribution($product);
        });

        $stats = [
            'average_rating' => $product->average_rating,
            'review_count' => $product->review_count,
            'rating_distribution' => $ratingDistribution,
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
