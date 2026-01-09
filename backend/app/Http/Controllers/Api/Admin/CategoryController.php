<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('sort_order')->orderBy('name')->get();

        return $this->success([
            'data' => $categories,
        ]);
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
