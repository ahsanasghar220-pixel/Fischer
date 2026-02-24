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
        // Public-facing caches (must match keys in CategoryController)
        Cache::forget('all_categories');
        Cache::forget('featured_categories');
        Cache::forget('category_tree');
        Cache::forget('categories_with_count');
        Cache::forget('categories_index');
        Cache::forget('categories_index_featured');
        Cache::forget('categories_featured');
        Cache::forget('categories_tree');
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

        $wasActive = $category->is_active;

        $category->update($validated);
        $this->clearCache();

        // Cascade deactivation: if category was just disabled, disable all its products
        if ($wasActive && !$category->fresh()->is_active) {
            Product::where('category_id', $id)->update(['is_active' => false]);
        }

        return $this->success($category->fresh(), 'Category updated successfully');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Cascade: soft-delete all products in this category first
        Product::where('category_id', $id)->each(fn ($p) => $p->delete());

        $category->delete();
        $this->clearCache();

        return $this->success(null, 'Category deleted successfully');
    }

    public function export()
    {
        $categories = DB::table('categories')
            ->select(['slug', 'name', 'description', 'is_active', 'sort_order', 'image'])
            ->whereNull('deleted_at')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $cols = ['slug', 'name', 'description', 'is_active', 'sort_order', 'image'];

        $csv = implode(',', $cols) . "\n";
        foreach ($categories as $c) {
            $row = array_map(fn ($h) => '"' . str_replace('"', '""', (string) ($c->$h ?? '')) . '"', $cols);
            $csv .= implode(',', $row) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="categories-' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $handle  = fopen($request->file('file')->getPathname(), 'r');
        $headers = array_map('trim', fgetcsv($handle) ?: []);

        if (empty($headers) || !in_array('slug', $headers)) {
            fclose($handle);
            return $this->error('Invalid CSV: missing required header "slug"', 422);
        }

        $created = 0;
        $updated = 0;
        $errors  = [];
        $rowNum  = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNum++;
            if (count($row) !== count($headers)) {
                continue;
            }
            $data = array_combine($headers, array_map('trim', $row));

            if (empty($data['slug']) || empty($data['name'])) {
                $errors[] = ['row' => $rowNum, 'message' => 'Missing required fields: slug, name'];
                continue;
            }

            $payload = ['name' => $data['name']];

            if (isset($data['description'])  && $data['description']  !== '') $payload['description']  = $data['description'];
            if (isset($data['image'])        && $data['image']         !== '') $payload['image']        = $data['image'];
            if (isset($data['sort_order'])   && is_numeric($data['sort_order'])) $payload['sort_order'] = (int) $data['sort_order'];
            if (isset($data['is_active'])    && $data['is_active']     !== '') $payload['is_active']    = (bool)(int) $data['is_active'];

            $category = Category::updateOrCreate(['slug' => $data['slug']], $payload);
            $category->wasRecentlyCreated ? $created++ : $updated++;
        }

        fclose($handle);
        $this->clearCache();

        $msg = "{$created} category/categories created, {$updated} updated";
        if (count($errors)) {
            $msg .= ', ' . count($errors) . ' row(s) had errors';
        }

        return $this->success(['created' => $created, 'updated' => $updated, 'errors' => $errors], $msg);
    }
}
