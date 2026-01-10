<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
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
                'id', 'name', 'slug', 'description', 'image', 'icon',
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
                    'id', 'name', 'slug', 'description', 'image', 'icon',
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

        return $this->success([
            'data' => $category,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Check for duplicate slug
        $slugCount = Category::where('slug', $validated['slug'])->count();
        if ($slugCount > 0) {
            $validated['slug'] .= '-' . ($slugCount + 1);
        }

        $category = Category::create($validated);

        return $this->success([
            'data' => $category,
        ], 'Category created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Category::where('slug', $validated['slug'])->where('id', '!=', $id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        $category->update($validated);

        return $this->success([
            'data' => $category->fresh(),
        ], 'Category updated successfully');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return $this->error('Cannot delete category with products. Move or delete products first.', 422);
        }

        $category->delete();

        return $this->success(null, 'Category deleted successfully');
    }
}
