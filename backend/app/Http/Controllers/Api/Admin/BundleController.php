<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BundleResource;
use App\Http\Resources\BundleSlotResource;
use App\Http\Resources\BundleItemResource;
use App\Models\Bundle;
use App\Http\Requests\Admin\StoreBundleRequest;
use App\Http\Requests\Admin\UpdateBundleRequest;
use App\Services\BundleManagementService;
use App\Services\BundlePricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BundleController extends Controller
{
    public function __construct(
        private BundlePricingService $pricingService,
        private BundleManagementService $bundleService,
    ) {}

    // -------------------------------------------------------------------------
    // Core CRUD
    // -------------------------------------------------------------------------

    /**
     * List all bundles with filters
     */
    public function index(Request $request)
    {
        try {
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
            $sortBy    = $request->sort_by ?? 'created_at';
            $sortOrder = $request->sort_order ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            $perPage = min($request->per_page ?? 15, 50);
            $bundles = $query->paginate($perPage);

            return $this->paginated($bundles, BundleResource::class);
        } catch (\Exception $e) {
            \Log::error('Bundle index error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return $this->error('Failed to load bundles: ' . $e->getMessage(), 500);
        }
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
    public function store(StoreBundleRequest $request)
    {
        $validated = $request->validated();

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
                        'product_id'     => $item['product_id'],
                        'quantity'       => $item['quantity'] ?? 1,
                        'price_override' => $item['price_override'] ?? null,
                        'sort_order'     => $index,
                    ]);
                }
            }

            // Create slots for configurable bundles
            if ($bundle->isConfigurable() && !empty($slots)) {
                foreach ($slots as $index => $slotData) {
                    $slot = $bundle->slots()->create([
                        'name'           => $slotData['name'],
                        'description'    => $slotData['description'] ?? null,
                        'slot_order'     => $index,
                        'is_required'    => $slotData['is_required'] ?? true,
                        'min_selections' => $slotData['min_selections'] ?? 1,
                        'max_selections' => $slotData['max_selections'] ?? 1,
                    ]);

                    if (!empty($slotData['products'])) {
                        foreach ($slotData['products'] as $productData) {
                            $slot->products()->create([
                                'product_id'     => $productData['product_id'],
                                'price_override' => $productData['price_override'] ?? null,
                            ]);
                        }
                    }
                }
            }

            return $bundle;
        });

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
    public function update(UpdateBundleRequest $request, $id)
    {
        $bundle    = Bundle::findOrFail($id);
        $validated = $request->validated();

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $bundle->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $slugCount = Bundle::where('slug', $validated['slug'])->where('id', '!=', $id)->count();
            if ($slugCount > 0) {
                $validated['slug'] .= '-' . ($slugCount + 1);
            }
        }

        DB::transaction(function () use ($bundle, $validated) {
            $items = $validated['items'] ?? null;
            $slots = $validated['slots'] ?? null;
            unset($validated['items'], $validated['slots']);

            $bundle->update($validated);

            // Update items for fixed bundles
            if ($items !== null && $bundle->isFixed()) {
                $bundle->items()->delete();
                foreach ($items as $index => $item) {
                    $bundle->items()->create([
                        'product_id'     => $item['product_id'],
                        'quantity'       => $item['quantity'] ?? 1,
                        'price_override' => $item['price_override'] ?? null,
                        'sort_order'     => $index,
                    ]);
                }
            }

            // Update slots for configurable bundles
            if ($slots !== null && $bundle->isConfigurable()) {
                $bundle->slots()->delete();
                foreach ($slots as $index => $slotData) {
                    $slot = $bundle->slots()->create([
                        'name'           => $slotData['name'],
                        'description'    => $slotData['description'] ?? null,
                        'slot_order'     => $index,
                        'is_required'    => $slotData['is_required'] ?? true,
                        'min_selections' => $slotData['min_selections'] ?? 1,
                        'max_selections' => $slotData['max_selections'] ?? 1,
                    ]);

                    if (!empty($slotData['products'])) {
                        foreach ($slotData['products'] as $productData) {
                            $slot->products()->create([
                                'product_id'     => $productData['product_id'],
                                'price_override' => $productData['price_override'] ?? null,
                            ]);
                        }
                    }
                }
            }
        });

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

        Cache::forget('homepage_bundles');

        return $this->success(null, 'Bundle deleted successfully');
    }

    // -------------------------------------------------------------------------
    // Additional HTTP actions
    // -------------------------------------------------------------------------

    /**
     * Duplicate a bundle
     */
    public function duplicate($id)
    {
        $bundle = Bundle::with(['items', 'slots.products', 'images'])->findOrFail($id);
        $clone  = $bundle->duplicate();

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
                'view_count'       => $bundle->view_count,
                'add_to_cart_count' => $bundle->add_to_cart_count,
                'purchase_count'   => $bundle->purchase_count,
                'revenue'          => (float) $bundle->revenue,
                'conversion_rate'  => $bundle->getConversionRate(),
                'add_to_cart_rate' => $bundle->getAddToCartRate(),
            ],
            'stock' => [
                'limit'     => $bundle->stock_limit,
                'sold'      => $bundle->stock_sold,
                'remaining' => $bundle->stock_remaining,
            ],
            'pricing' => $this->pricingService->getPricingBreakdown($bundle),
        ];

        return $this->success($analytics);
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array',
            'ids.*'  => 'integer|exists:bundles,id',
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

        Cache::forget('homepage_bundles');

        return $this->success(['affected' => $count], "Bulk {$validated['action']} completed successfully");
    }

    // -------------------------------------------------------------------------
    // Slot Management — HTTP layer delegates to BundleManagementService
    // -------------------------------------------------------------------------

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
            'name'                       => 'required|string|max:100',
            'description'                => 'nullable|string',
            'is_required'                => 'boolean',
            'min_selections'             => 'nullable|integer|min:0',
            'max_selections'             => 'nullable|integer|min:1',
            'products'                   => 'nullable|array',
            'products.*.product_id'      => 'required|exists:products,id',
            'products.*.price_override'  => 'nullable|numeric|min:0',
        ]);

        $slot = $this->bundleService->addSlot($bundle, $validated);

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
        $slot   = $bundle->slots()->findOrFail($slotId);

        $validated = $request->validate([
            'name'                       => 'sometimes|required|string|max:100',
            'description'                => 'nullable|string',
            'slot_order'                 => 'nullable|integer|min:0',
            'is_required'                => 'boolean',
            'min_selections'             => 'nullable|integer|min:0',
            'max_selections'             => 'nullable|integer|min:1',
            'products'                   => 'nullable|array',
            'products.*.product_id'      => 'required|exists:products,id',
            'products.*.price_override'  => 'nullable|numeric|min:0',
        ]);

        $slot = $this->bundleService->updateSlot($slot, $validated);

        return $this->success(
            new BundleSlotResource($slot),
            'Slot updated successfully'
        );
    }

    /**
     * Remove a slot
     */
    public function removeSlot($id, $slotId)
    {
        $bundle = Bundle::findOrFail($id);
        $slot   = $bundle->slots()->findOrFail($slotId);

        $this->bundleService->removeSlot($slot);

        return $this->success(null, 'Slot removed successfully');
    }

    // -------------------------------------------------------------------------
    // Item Management — HTTP layer delegates to BundleManagementService
    // -------------------------------------------------------------------------

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
            'product_id'     => 'required|exists:products,id',
            'quantity'       => 'nullable|integer|min:1',
            'price_override' => 'nullable|numeric|min:0',
        ]);

        // Check if product already in bundle
        if ($bundle->items()->where('product_id', $validated['product_id'])->exists()) {
            return $this->error('Product already exists in this bundle', 422);
        }

        $item = $this->bundleService->addItem($bundle, $validated);

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
        $item   = $bundle->items()->findOrFail($itemId);

        $validated = $request->validate([
            'quantity'       => 'nullable|integer|min:1',
            'price_override' => 'nullable|numeric|min:0',
            'sort_order'     => 'nullable|integer|min:0',
        ]);

        $item = $this->bundleService->updateItem($item, $validated);

        return $this->success(
            new BundleItemResource($item),
            'Item updated successfully'
        );
    }

    /**
     * Remove an item
     */
    public function removeItem($id, $itemId)
    {
        $bundle = Bundle::findOrFail($id);
        $item   = $bundle->items()->findOrFail($itemId);

        $this->bundleService->removeItem($item);

        return $this->success(null, 'Item removed successfully');
    }

    // -------------------------------------------------------------------------
    // Image Management — HTTP layer delegates to BundleManagementService
    // -------------------------------------------------------------------------

    /**
     * Upload images
     */
    public function uploadImages(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        $request->validate([
            'images'   => 'required|array',
            'images.*' => 'image|max:2048',
        ]);

        $uploadedImages = $this->bundleService->uploadImages($bundle, $request->file('images'));

        return $this->success(['images' => $uploadedImages], 'Images uploaded successfully');
    }

    /**
     * Delete an image
     */
    public function deleteImage($id, $imageId)
    {
        $bundle = Bundle::findOrFail($id);
        $image  = $bundle->images()->findOrFail($imageId);

        $this->bundleService->deleteImage($image);

        return $this->success(null, 'Image deleted successfully');
    }

    /**
     * Set primary image
     */
    public function setPrimaryImage($id, $imageId)
    {
        $bundle = Bundle::findOrFail($id);
        $image  = $bundle->images()->findOrFail($imageId);
        $image->makePrimary();

        return $this->success(null, 'Primary image updated successfully');
    }
}
