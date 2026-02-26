<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search');
        $status = $request->get('status');
        $categoryId = $request->get('category_id');
        $perPage = 15;

        // Raw query for maximum speed
        $query = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('product_images', function ($join) {
                $join->on('products.id', '=', 'product_images.product_id')
                    ->where('product_images.is_primary', '=', true);
            })
            ->select([
                'products.id',
                'products.name',
                'products.slug',
                'products.sku',
                'products.price',
                'products.stock_quantity',
                'products.stock_status',
                'products.is_active',
                'categories.id as category_id',
                'categories.name as category_name',
                'categories.slug as category_slug',
                'product_images.image as primary_image',
            ])
            ->whereNull('products.deleted_at');

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                  ->orWhere('products.sku', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status) {
            switch ($status) {
                case 'active':
                    $query->where('products.is_active', true);
                    break;
                case 'inactive':
                    $query->where('products.is_active', false);
                    break;
                case 'out_of_stock':
                    $query->where('products.stock_quantity', '<=', 0);
                    break;
                case 'low_stock':
                    $query->where('products.stock_quantity', '>', 0)
                          ->where('products.stock_quantity', '<=', 10);
                    break;
            }
        }

        // Filter by category
        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
        }

        // Get total
        $total = $query->count();

        // Get paginated results
        $products = $query->orderByDesc('products.created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Transform
        $transformedProducts = $products->map(function ($product) {
            $imageUrl = null;
            if ($product->primary_image) {
                $imageUrl = str_starts_with($product->primary_image, 'http')
                    ? $product->primary_image
                    : (str_starts_with($product->primary_image, '/') ? $product->primary_image : '/' . $product->primary_image);
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'stock' => (int) ($product->stock_quantity ?? 0),
                'stock_status' => $product->stock_status,
                'is_active' => (bool) $product->is_active,
                'primary_image' => $imageUrl,
                'category' => $product->category_id ? [
                    'id' => $product->category_id,
                    'name' => $product->category_name,
                    'slug' => $product->category_slug,
                ] : null,
            ];
        });

        return $this->success([
            'data' => $transformedProducts,
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'total' => $total,
            ],
        ]);
    }

    public function show($id)
    {
        $product = Product::with([
            'category:id,name,slug',
            'images',
            'variants.attributeValues.attribute',
            'attributes.values',
        ])->findOrFail($id);

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
            'specifications' => 'nullable|string',
        ]);

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

        // Clear dashboard cache
        Cache::forget('admin_dashboard');

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
            'specifications' => 'nullable|string',
        ]);

        if (isset($validated['stock'])) {
            $validated['stock_quantity'] = $validated['stock'];
            unset($validated['stock']);
        }

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Product::where('slug', $validated['slug'])->where('id', '!=', $id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        $product->update($validated);

        // Clear dashboard cache
        Cache::forget('admin_dashboard');

        return $this->success([
            'data' => $product->fresh(),
        ], 'Product updated successfully');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        // Clear dashboard cache
        Cache::forget('admin_dashboard');

        return $this->success(null, 'Product deleted successfully');
    }

    public function uploadImages(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:5120',
        ]);

        $uploadedImages = [];
        foreach ($request->file('images') as $file) {
            // Convert to WebP using Intervention Image
            $filename = Str::uuid() . '.webp';
            $directory = 'products';

            // Ensure directory exists
            Storage::disk('public')->makeDirectory($directory);

            $manager = new ImageManager(new Driver());
            $img = $manager->read($file->getPathname());
            $encoded = $img->toWebp(85);
            Storage::disk('public')->put($directory . '/' . $filename, (string) $encoded);

            $productImage = $product->images()->create([
                'image' => '/storage/' . $directory . '/' . $filename,
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

        $path = str_replace('/storage/', '', $image->image ?? $image->url ?? '');
        if ($path) {
            \Storage::disk('public')->delete($path);
        }

        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }

    public function setPrimaryImage($productId, $imageId)
    {
        $product = Product::findOrFail($productId);
        $image = $product->images()->findOrFail($imageId);

        // Unset all other images as primary
        $product->images()->update(['is_primary' => false]);

        // Set the selected image as primary
        $image->update(['is_primary' => true]);

        return $this->success(null, 'Primary image updated successfully');
    }

    public function export()
    {
        $products = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select([
                'products.sku',
                'products.name',
                'categories.slug as category_slug',
                'products.price',
                'products.compare_price',
                'products.stock_quantity',
                'products.stock_status',
                'products.is_active',
                'products.is_featured',
                'products.is_new',
                'products.is_bestseller',
                'products.short_description',
                'products.weight',
                'products.meta_title',
                'products.meta_description',
            ])
            ->whereNull('products.deleted_at')
            ->orderBy('products.name')
            ->get();

        $cols = [
            'sku', 'name', 'category_slug', 'price', 'compare_price',
            'stock_quantity', 'stock_status', 'is_active', 'is_featured',
            'is_new', 'is_bestseller', 'short_description', 'weight',
            'meta_title', 'meta_description',
        ];

        $csv = implode(',', $cols) . "\n";
        foreach ($products as $p) {
            $row = array_map(fn ($h) => '"' . str_replace('"', '""', (string) ($p->$h ?? '')) . '"', $cols);
            $csv .= implode(',', $row) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="products-' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $handle  = fopen($request->file('file')->getPathname(), 'r');
        $headers = array_map('trim', fgetcsv($handle) ?: []);

        if (empty($headers) || !in_array('sku', $headers)) {
            fclose($handle);
            return $this->error('Invalid CSV: missing required header "sku"', 422);
        }

        $created = 0;
        $updated = 0;
        $errors  = [];
        $rowNum  = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNum++;
            if (count($row) !== count($headers)) {
                continue; // blank / malformed line
            }
            $data = array_combine($headers, array_map('trim', $row));

            if (empty($data['sku']) || empty($data['name']) || !isset($data['price']) || $data['price'] === '') {
                $errors[] = ['row' => $rowNum, 'message' => 'Missing required fields: sku, name, price'];
                continue;
            }

            $categoryId = null;
            if (!empty($data['category_slug'] ?? '')) {
                $cat = \App\Models\Category::where('slug', $data['category_slug'])->first();
                if (!$cat) {
                    $errors[] = ['row' => $rowNum, 'message' => "Category slug \"{$data['category_slug']}\" not found — row skipped"];
                    continue;
                }
                $categoryId = $cat->id;
            }

            $payload = [
                'name'              => $data['name'],
                'slug'              => Str::slug($data['name']),
                'price'             => (float) $data['price'],
                'stock_quantity'    => isset($data['stock_quantity']) && $data['stock_quantity'] !== '' ? (int) $data['stock_quantity'] : 100,
                'stock_status'      => in_array($data['stock_status'] ?? '', ['in_stock', 'out_of_stock', 'backorder']) ? $data['stock_status'] : 'in_stock',
                'is_active'         => isset($data['is_active'])    && $data['is_active']    !== '' ? (bool)(int) $data['is_active']    : true,
                'is_featured'       => isset($data['is_featured'])   && $data['is_featured']   !== '' ? (bool)(int) $data['is_featured']   : false,
                'is_new'            => isset($data['is_new'])        && $data['is_new']        !== '' ? (bool)(int) $data['is_new']        : false,
                'is_bestseller'     => isset($data['is_bestseller']) && $data['is_bestseller'] !== '' ? (bool)(int) $data['is_bestseller'] : false,
            ];

            if ($categoryId !== null)                               $payload['category_id']       = $categoryId;
            if (isset($data['compare_price'])  && is_numeric($data['compare_price']))  $payload['compare_price']     = (float) $data['compare_price'];
            if (isset($data['short_description']) && $data['short_description'] !== '') $payload['short_description'] = $data['short_description'];
            if (isset($data['weight'])         && is_numeric($data['weight']))         $payload['weight']            = (float) $data['weight'];
            if (isset($data['meta_title'])     && $data['meta_title'] !== '')          $payload['meta_title']        = $data['meta_title'];
            if (isset($data['meta_description']) && $data['meta_description'] !== '')  $payload['meta_description']  = $data['meta_description'];

            $product = Product::updateOrCreate(['sku' => $data['sku']], $payload);
            $product->wasRecentlyCreated ? $created++ : $updated++;
        }

        fclose($handle);
        Cache::forget('admin_dashboard');

        $msg = "{$created} product(s) created, {$updated} updated";
        if (count($errors)) {
            $msg .= ', ' . count($errors) . ' row(s) had errors';
        }

        return $this->success(['created' => $created, 'updated' => $updated, 'errors' => $errors], $msg);
    }
}
