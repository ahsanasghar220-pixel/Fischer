<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BundleResource;
use App\Http\Resources\BundleSlotResource;
use App\Http\Resources\BundleItemResource;
use App\Models\Bundle;
use App\Models\BundleSlot;
use App\Models\BundleItem;
use App\Models\BundleImage;
use App\Services\BundlePricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BundleController extends Controller
{
    protected BundlePricingService $pricingService;

    public function __construct(BundlePricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * List all bundles with filters
     */
    public function index(Request $request)
    {
        $query = Bundle::with(['items.product.images', 'slots', 'images']);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter by type
        if ($request->type) {
            $query->where('bundle_type', $request->type);
        }

        // Filter by homepage position
        if ($request->homepage_position) {
            $query->where('homepage_position', $request->homepage_position);
        }

        // Filter by date range
        if ($request->starts_after) {
            $query->where('starts_at', '>=', $request->starts_after);
        }
        if ($request->ends_before) {
            $query->where('ends_at', '<=', $request->ends_before);
        }

        // Only available
        if ($request->available_only) {
            $query->available();
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->per_page ?? 15, 50);
        $bundles = $query->paginate($perPage);

        return $this->paginated($bundles, BundleResource::class);
    }

    /**
     * Get a single bundle
     */
    public function show($id)
    {
        $bundle = Bundle::with([
            'items.product.images',
            'slots.products.product.images',
            'images',
        ])->findOrFail($id);

        return $this->success(new BundleResource($bundle));
    }

    /**
     * Create a new bundle
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:bundles,sku',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'discount_type' => 'required|in:fixed_price,percentage',
            'discount_value' => 'required|numeric|min:0',
            'badge_label' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:20',
            'theme_color' => 'nullable|string|max:20',
            'featured_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'video_url' => 'nullable|url',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'stock_limit' => 'nullable|integer|min:0',
            'bundle_type' => 'required|in:fixed,configurable',
            'cart_display' => 'nullable|in:single_item,grouped,individual',
            'allow_coupon_stacking' => 'boolean',
            'show_on_homepage' => 'boolean',
            'homepage_position' => 'nullable|in:carousel,grid,banner',
            'display_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|array',
            'cta_text' => 'nullable|string|max:100',
            'show_countdown' => 'boolean',
            'show_savings' => 'boolean',
            // Items for fixed bundles
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'nullable|integer|min:1',
            'items.*.price_override' => 'nullable|numeric|min:0',
            // Slots for configurable bundles
            'slots' => 'nullable|array',
            'slots.*.name' => 'required_with:slots|string|max:100',
            'slots.*.description' => 'nullable|string',
            'slots.*.is_required' => 'boolean',
            'slots.*.min_selections' => 'nullable|integer|min:0',
            'slots.*.max_selections' => 'nullable|integer|min:1',
            'slots.*.products' => 'nullable|array',
            'slots.*.products.*.product_id' => 'required|exists:products,id',
            'slots.*.products.*.price_override' => 'nullable|numeric|min:0',
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['name']);
        $slugCount = Bundle::where('slug', $validated['slug'])->count();
        if ($slugCount > 0) {
            $validated['slug'] .= '-' . ($slugCount + 1);
        }

        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = 'BND-' . strtoupper(Str::random(8));
        }

        $bundle = DB::transaction(function () use ($validated) {
            $items = $validated['items'] ?? [];
            $slots = $validated['slots'] ?? [];
            unset($validated['items'], $validated['slots']);

            $bundle = Bundle::create($validated);

            // Create items for fixed bundles
            if ($bundle->isFixed() && !empty($items)) {
                foreach ($items as $index => $item) {
                    $bundle->items()->create([
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'] ?? 1,
                        'price_override' => $item['price_override'] ?? null,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Create slots for configurable bundles
            if ($bundle->isConfigurable() && !empty($slots)) {
                foreach ($slots as $index => $slotData) {
                    $slot = $bundle->slots()->create([
                        'name' => $slotData['name'],
                        'description' => $slotData['description'] ?? null,
                        'slot_order' => $index,
                        'is_required' => $slotData['is_required'] ?? true,
                        'min_selections' => $slotData['min_selections'] ?? 1,
                        'max_selections' => $slotData['max_selections'] ?? 1,
                    ]);

                    // Add products to slot
                    if (!empty($slotData['products'])) {
                        foreach ($slotData['products'] as $productData) {
                            $slot->products()->create([
                                'product_id' => $productData['product_id'],
                                'price_override' => $productData['price_override'] ?? null,
                            ]);
                        }
                    }
                }
            }

            return $bundle;
        });

        // Clear cache
        Cache::forget('homepage_bundles');

        return $this->success(
            new BundleResource($bundle->load(['items.product', 'slots.products.product'])),
            'Bundle created successfully',
            201
        );
    }

    /**
     * Update a bundle
     */
    public function update(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:bundles,sku,' . $id,
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'discount_type' => 'sometimes|in:fixed_price,percentage',
            'discount_value' => 'sometimes|numeric|min:0',
            'badge_label' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:20',
            'theme_color' => 'nullable|string|max:20',
            'featured_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'video_url' => 'nullable|url',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'stock_limit' => 'nullable|integer|min:0',
            'bundle_type' => 'sometimes|in:fixed,configurable',
            'cart_display' => 'nullable|in:single_item,grouped,individual',
            'allow_coupon_stacking' => 'boolean',
            'show_on_homepage' => 'boolean',
            'homepage_position' => 'nullable|in:carousel,grid,banner',
            'display_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|array',
            'cta_text' => 'nullable|string|max:100',
            'show_countdown' => 'boolean',
            'show_savings' => 'boolean',
        ]);

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $bundle->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Bundle::where('slug', $validated['slug'])->where('id', '!=', $id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        $bundle->update($validated);

        // Clear cache
        Cache::forget('homepage_bundles');

        return $this->success(
            new BundleResource($bundle->fresh()->load(['items.product', 'slots.products.product'])),
            'Bundle updated successfully'
        );
    }

    /**
     * Delete a bundle
     */
    public function destroy($id)
    {
        $bundle = Bundle::findOrFail($id);
        $bundle->delete();

        // Clear cache
        Cache::forget('homepage_bundles');

        return $this->success(null, 'Bundle deleted successfully');
    }

    /**
     * Duplicate a bundle
     */
    public function duplicate($id)
    {
        $bundle = Bundle::with(['items', 'slots.products', 'images'])->findOrFail($id);
        $clone = $bundle->duplicate();

        return $this->success(
            new BundleResource($clone->load(['items.product', 'slots.products.product'])),
            'Bundle duplicated successfully',
            201
        );
    }

    /**
     * Toggle bundle active status
     */
    public function toggle($id)
    {
        $bundle = Bundle::findOrFail($id);
        $bundle->update(['is_active' => !$bundle->is_active]);

        // Clear cache
        Cache::forget('homepage_bundles');

        return $this->success([
            'is_active' => $bundle->is_active,
        ], $bundle->is_active ? 'Bundle activated' : 'Bundle deactivated');
    }

    /**
     * Get bundle analytics
     */
    public function analytics($id)
    {
        $bundle = Bundle::findOrFail($id);

        $analytics = [
            'overview' => [
                'view_count' => $bundle->view_count,
                'add_to_cart_count' => $bundle->add_to_cart_count,
                'purchase_count' => $bundle->purchase_count,
                'revenue' => (float) $bundle->revenue,
                'conversion_rate' => $bundle->getConversionRate(),
                'add_to_cart_rate' => $bundle->getAddToCartRate(),
            ],
            'stock' => [
                'limit' => $bundle->stock_limit,
                'sold' => $bundle->stock_sold,
                'remaining' => $bundle->stock_remaining,
            ],
            'pricing' => $this->pricingService->getPricingBreakdown($bundle),
        ];

        return $this->success($analytics);
    }

    // --- Slot Management ---

    /**
     * Add a slot to a configurable bundle
     */
    public function addSlot(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        if (!$bundle->isConfigurable()) {
            return $this->error('Cannot add slots to a fixed bundle', 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_required' => 'boolean',
            'min_selections' => 'nullable|integer|min:0',
            'max_selections' => 'nullable|integer|min:1',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.price_override' => 'nullable|numeric|min:0',
        ]);

        $slot = DB::transaction(function () use ($bundle, $validated) {
            $slot = $bundle->slots()->create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'slot_order' => $bundle->slots()->max('slot_order') + 1,
                'is_required' => $validated['is_required'] ?? true,
                'min_selections' => $validated['min_selections'] ?? 1,
                'max_selections' => $validated['max_selections'] ?? 1,
            ]);

            if (!empty($validated['products'])) {
                foreach ($validated['products'] as $productData) {
                    $slot->products()->create([
                        'product_id' => $productData['product_id'],
                        'price_override' => $productData['price_override'] ?? null,
                    ]);
                }
            }

            return $slot;
        });

        return $this->success(
            new BundleSlotResource($slot->load('products.product')),
            'Slot added successfully',
            201
        );
    }

    /**
     * Update a slot
     */
    public function updateSlot(Request $request, $id, $slotId)
    {
        $bundle = Bundle::findOrFail($id);
        $slot = $bundle->slots()->findOrFail($slotId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'slot_order' => 'nullable|integer|min:0',
            'is_required' => 'boolean',
            'min_selections' => 'nullable|integer|min:0',
            'max_selections' => 'nullable|integer|min:1',
            'products' => 'nullable|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.price_override' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($slot, $validated) {
            $products = $validated['products'] ?? null;
            unset($validated['products']);

            $slot->update($validated);

            // Replace products if provided
            if ($products !== null) {
                $slot->products()->delete();
                foreach ($products as $productData) {
                    $slot->products()->create([
                        'product_id' => $productData['product_id'],
                        'price_override' => $productData['price_override'] ?? null,
                    ]);
                }
            }
        });

        return $this->success(
            new BundleSlotResource($slot->fresh()->load('products.product')),
            'Slot updated successfully'
        );
    }

    /**
     * Remove a slot
     */
    public function removeSlot($id, $slotId)
    {
        $bundle = Bundle::findOrFail($id);
        $slot = $bundle->slots()->findOrFail($slotId);
        $slot->delete();

        return $this->success(null, 'Slot removed successfully');
    }

    // --- Item Management ---

    /**
     * Add an item to a fixed bundle
     */
    public function addItem(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        if (!$bundle->isFixed()) {
            return $this->error('Cannot add items to a configurable bundle', 422);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
            'price_override' => 'nullable|numeric|min:0',
        ]);

        // Check if product already in bundle
        if ($bundle->items()->where('product_id', $validated['product_id'])->exists()) {
            return $this->error('Product already exists in this bundle', 422);
        }

        $item = $bundle->items()->create([
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'] ?? 1,
            'price_override' => $validated['price_override'] ?? null,
            'sort_order' => $bundle->items()->max('sort_order') + 1,
        ]);

        return $this->success(
            new BundleItemResource($item->load('product')),
            'Item added successfully',
            201
        );
    }

    /**
     * Update an item
     */
    public function updateItem(Request $request, $id, $itemId)
    {
        $bundle = Bundle::findOrFail($id);
        $item = $bundle->items()->findOrFail($itemId);

        $validated = $request->validate([
            'quantity' => 'nullable|integer|min:1',
            'price_override' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $item->update($validated);

        return $this->success(
            new BundleItemResource($item->fresh()->load('product')),
            'Item updated successfully'
        );
    }

    /**
     * Remove an item
     */
    public function removeItem($id, $itemId)
    {
        $bundle = Bundle::findOrFail($id);
        $item = $bundle->items()->findOrFail($itemId);
        $item->delete();

        return $this->success(null, 'Item removed successfully');
    }

    // --- Image Management ---

    /**
     * Upload images
     */
    public function uploadImages(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:2048',
        ]);

        $uploadedImages = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('bundles', 'public');
            $bundleImage = $bundle->images()->create([
                'image' => '/storage/' . $path,
                'is_primary' => $bundle->images()->count() === 0,
            ]);
            $uploadedImages[] = $bundleImage;
        }

        return $this->success([
            'images' => $uploadedImages,
        ], 'Images uploaded successfully');
    }

    /**
     * Delete an image
     */
    public function deleteImage($id, $imageId)
    {
        $bundle = Bundle::findOrFail($id);
        $image = $bundle->images()->findOrFail($imageId);

        $path = str_replace('/storage/', '', $image->image ?? '');
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }

    /**
     * Set primary image
     */
    public function setPrimaryImage($id, $imageId)
    {
        $bundle = Bundle::findOrFail($id);
        $image = $bundle->images()->findOrFail($imageId);
        $image->makePrimary();

        return $this->success(null, 'Primary image updated successfully');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:bundles,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $count = 0;

        switch ($validated['action']) {
            case 'activate':
                $count = Bundle::whereIn('id', $validated['ids'])->update(['is_active' => true]);
                break;
            case 'deactivate':
                $count = Bundle::whereIn('id', $validated['ids'])->update(['is_active' => false]);
                break;
            case 'delete':
                $count = Bundle::whereIn('id', $validated['ids'])->delete();
                break;
        }

        // Clear cache
        Cache::forget('homepage_bundles');

        return $this->success([
            'affected' => $count,
        ], "Bulk {$validated['action']} completed successfully");
    }
}
