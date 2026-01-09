<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category:id,name,slug', 'images']);

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            switch ($status) {
                case 'active':
                    $query->where('is_active', true);
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'out_of_stock':
                    $query->where('stock', 0);
                    break;
                case 'low_stock':
                    $query->where('stock', '>', 0)->where('stock', '<=', 10);
                    break;
            }
        }

        // Filter by category
        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $products = $query->orderByDesc('created_at')->paginate(15);

        // Transform the data
        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock_quantity ?? 0,
                'stock_status' => $product->stock_status,
                'is_active' => $product->is_active,
                'primary_image' => $product->primary_image,
                'category' => $product->category,
            ];
        });

        return $this->success([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'images'])->findOrFail($id);

        // Return product directly without extra wrapper
        return $this->success($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:products,sku',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'stock_status' => 'nullable|string|in:in_stock,out_of_stock,backorder,preorder',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Map 'stock' to 'stock_quantity' if sent from frontend
        if (isset($validated['stock'])) {
            $validated['stock_quantity'] = $validated['stock'];
            unset($validated['stock']);
        }

        $validated['slug'] = Str::slug($validated['name']);

        // Check for duplicate slug
        $slugCount = Product::where('slug', $validated['slug'])->count();
        if ($slugCount > 0) {
            $validated['slug'] .= '-' . ($slugCount + 1);
        }

        $product = Product::create($validated);

        return $this->success([
            'data' => $product,
        ], 'Product created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|max:100|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'stock_status' => 'nullable|string|in:in_stock,out_of_stock,backorder,preorder',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Map 'stock' to 'stock_quantity' if sent from frontend
        if (isset($validated['stock'])) {
            $validated['stock_quantity'] = $validated['stock'];
            unset($validated['stock']);
        }

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Product::where('slug', $validated['slug'])->where('id', '!=', $id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        $product->update($validated);

        return $this->success([
            'data' => $product->fresh(),
        ], 'Product updated successfully');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    public function uploadImages(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:2048',
        ]);

        $uploadedImages = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('products', 'public');
            $productImage = $product->images()->create([
                'url' => '/storage/' . $path,
                'is_primary' => $product->images()->count() === 0,
            ]);
            $uploadedImages[] = $productImage;
        }

        return $this->success([
            'images' => $uploadedImages,
        ], 'Images uploaded successfully');
    }

    public function deleteImage($productId, $imageId)
    {
        $product = Product::findOrFail($productId);
        $image = $product->images()->findOrFail($imageId);

        // Delete file from storage
        $path = str_replace('/storage/', '', $image->url);
        \Storage::disk('public')->delete($path);

        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }
}
