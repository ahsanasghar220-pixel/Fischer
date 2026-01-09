<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with(['children' => function ($query) {
                $query->active()
                    ->ordered()
                    ->withCount(['products' => fn($q) => $q->active()]);
            }])
            ->active()
            ->topLevel()
            ->withCount(['products' => fn($q) => $q->active()])
            ->ordered();

        if ($request->featured) {
            $query->featured();
        }

        // Get categories and ensure uniqueness by name (keep the one with highest products_count)
        $categories = $query->get()
            ->groupBy('name')
            ->map(function ($group) {
                return $group->sortByDesc('products_count')->first();
            })
            ->values();

        return $this->success($categories);
    }

    public function show(string $slug, Request $request)
    {
        $category = Category::with(['children' => function ($query) {
            $query->active()->ordered();
        }])
        ->where('slug', $slug)
        ->active()
        ->firstOrFail();

        // Get all category IDs (including children) for product query
        $categoryIds = $category->getAllChildrenIds();

        // Get products in this category with pagination (fixed: was loading ALL products)
        $perPage = min($request->per_page ?? 24, 50);
        $products = \App\Models\Product::with(['images', 'category', 'brand'])
            ->active()
            ->whereIn('category_id', $categoryIds)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Cache price range for this category (changes infrequently)
        $cacheKey = "category_price_range_{$category->id}";
        $priceRange = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($categoryIds) {
            return \App\Models\Product::active()
                ->whereIn('category_id', $categoryIds)
                ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                ->first();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'breadcrumb' => $category->breadcrumb ?? [],
                'price_range' => [
                    'min' => $priceRange->min_price ?? 0,
                    'max' => $priceRange->max_price ?? 0,
                ],
            ],
            'products' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function featured()
    {
        $categories = Category::active()
            ->featured()
            ->ordered()
            ->limit(6)
            ->get();

        return $this->success($categories);
    }

    public function withProductCount()
    {
        $categories = Category::active()
            ->topLevel()
            ->withCount(['products' => function ($query) {
                $query->active();
            }])
            ->ordered()
            ->get();

        return $this->success($categories);
    }

    public function tree()
    {
        $categories = Category::with(['children' => function ($query) {
            $query->active()
                ->ordered()
                ->with(['children' => function ($q) {
                    $q->active()->ordered();
                }]);
        }])
        ->active()
        ->topLevel()
        ->ordered()
        ->get();

        return $this->success($categories);
    }
}
