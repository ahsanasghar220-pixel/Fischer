<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('children')
            ->active()
            ->topLevel()
            ->ordered();

        if ($request->featured) {
            $query->featured();
        }

        $categories = $query->get();

        return $this->success($categories);
    }

    public function show(string $slug)
    {
        $category = Category::with(['children' => function ($query) {
            $query->active()->ordered();
        }])
        ->where('slug', $slug)
        ->active()
        ->firstOrFail();

        // Get price range for products in this category
        $categoryIds = $category->getAllChildrenIds();
        $priceRange = \App\Models\Product::active()
            ->whereIn('category_id', $categoryIds)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return $this->success([
            'category' => $category,
            'breadcrumb' => $category->breadcrumb,
            'price_range' => [
                'min' => $priceRange->min_price ?? 0,
                'max' => $priceRange->max_price ?? 0,
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
