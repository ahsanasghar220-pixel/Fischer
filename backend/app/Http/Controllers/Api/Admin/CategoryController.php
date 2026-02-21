<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    private function clearCache(): void
    {
        Cache::forget('admin_categories');
        // Clear public-facing caches so the shop reflects changes immediately
        Cache::forget('all_categories');
        Cache::forget('featured_categories');
        Cache::forget('category_tree');
        Cache::forget('categories_with_count');
    }

    public function index(Request $request)
    {
        $search = $request->get('search');

        // Cache categories for 10 minutes if no search
        $cacheKey = $search ? null : 'admin_categories';
        if ($cacheKey && Cache::has($cacheKey)) {
            return $this->success(Cache::get($cacheKey));
        }

        // Fast raw query for parent categories
        $query = DB::table('categories')
            ->select([
                'id', 'name', 'slug', 'description', 'features', 'image', 'icon',
                'parent_id', 'sort_order', 'is_active', 'is_featured',
                DB::raw('(SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND products.deleted_at IS NULL) as products_count'),
            ])
            ->whereNull('deleted_at')
            ->whereNull('parent_id');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $parentCategories = $query->orderBy('sort_order')->orderBy('name')->get();

        // Get all children in one query
        $parentIds = $parentCategories->pluck('id')->toArray();
        $childrenMap = [];

        if (!empty($parentIds)) {
            $children = DB::table('categories')
                ->select([
                    'id', 'name', 'slug', 'description', 'features', 'image', 'icon',
                    'parent_id', 'sort_order', 'is_active', 'is_featured',
                    DB::raw('(SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND products.deleted_at IS NULL) as products_count'),
                ])
                ->whereIn('parent_id', $parentIds)
                ->whereNull('deleted_at')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

            foreach ($children as $child) {
                $childrenMap[$child->parent_id][] = $child;
            }
        }

        // Build result with children attached
        $result = $parentCategories->map(function ($cat) use ($childrenMap) {
            $cat->children = $childrenMap[$cat->id] ?? [];
            return $cat;
        });

        if ($cacheKey) {
            Cache::put($cacheKey, $result, 600);
        }

        return $this->success($result);
    }

    public function show($id)
    {
        $category = Category::withCount('products')->findOrFail($id);

        $products = Product::with(['images' => function ($q) {
                $q->orderBy('is_primary', 'desc')->orderBy('sort_order');
            }])
            ->where('category_id', $id)
            ->select(['id', 'name', 'sku', 'price', 'stock_status', 'is_active'])
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                $primary = $product->images->firstWhere('is_primary', true) ?? $product->images->first();
                $product->primary_image = $primary ? $primary->image : null;
                unset($product->images);
                return $product;
            });

        return $this->success([
            'category' => $category,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'slug'             => 'nullable|string|max:255',
            'description'      => 'nullable|string',
            'features'         => 'nullable|array',
            'features.*'       => 'string|max:255',
            'image'            => 'nullable|string|max:500',
            'icon'             => 'nullable|string|max:100',
            'parent_id'        => 'nullable|exists:categories,id',
            'sort_order'       => 'nullable|integer',
            'is_active'        => 'boolean',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Use provided slug or auto-generate from name
        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);
        unset($validated['slug']);

        // Ensure slug uniqueness
        $base  = $slug;
        $count = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $count++;
        }
        $validated['slug'] = $slug;

        $category = Category::create($validated);
        $this->clearCache();

        return $this->success($category, 'Category created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'slug'             => 'nullable|string|max:255',
            'description'      => 'nullable|string',
            'features'         => 'nullable|array',
            'features.*'       => 'string|max:255',
            'image'            => 'nullable|string|max:500',
            'icon'             => 'nullable|string|max:100',
            'parent_id'        => 'nullable|exists:categories,id',
            'sort_order'       => 'nullable|integer',
            'is_active'        => 'boolean',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Determine target slug
        $providedSlug = $validated['slug'] ?? null;
        unset($validated['slug']);

        if (!empty($providedSlug)) {
            $newSlug = Str::slug($providedSlug);
        } elseif (isset($validated['name']) && $validated['name'] !== $category->name) {
            $newSlug = Str::slug($validated['name']);
        } else {
            $newSlug = null; // no slug change needed
        }

        if ($newSlug && $newSlug !== $category->slug) {
            $base  = $newSlug;
            $count = 1;
            while (Category::where('slug', $newSlug)->where('id', '!=', $id)->exists()) {
                $newSlug = $base . '-' . $count++;
            }
            $validated['slug'] = $newSlug;
        }

        $category->update($validated);
        $this->clearCache();

        return $this->success($category->fresh(), 'Category updated successfully');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return $this->error('Cannot delete category with products. Move or delete products first.', 422);
        }

        $category->delete();
        $this->clearCache();

        return $this->success(null, 'Category deleted successfully');
    }
}
