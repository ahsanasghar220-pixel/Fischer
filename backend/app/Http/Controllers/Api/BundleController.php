<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BundleResource;
use App\Models\Bundle;
use App\Models\Cart;
use App\Services\BundlePricingService;
use App\Services\BundleCartService;
use Illuminate\Http\Request;

class BundleController extends Controller
{
    protected BundlePricingService $pricingService;
    protected BundleCartService $cartService;

    public function __construct(BundlePricingService $pricingService, BundleCartService $cartService)
    {
        $this->pricingService = $pricingService;
        $this->cartService = $cartService;
    }

    /**
     * List all available bundles
     */
    public function index(Request $request)
    {
        $query = Bundle::with(['items.product.images', 'slots.availableProducts.images', 'images'])
            ->available();

        // Filter by type
        if ($request->type) {
            $query->where('bundle_type', $request->type);
        }

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'display_order';
        $sortOrder = $request->sort_order ?? 'asc';

        match ($sortBy) {
            'price_low' => $query->orderByRaw('
                CASE
                    WHEN discount_type = "fixed_price" THEN discount_value
                    ELSE 0
                END ASC
            '),
            'price_high' => $query->orderByRaw('
                CASE
                    WHEN discount_type = "fixed_price" THEN discount_value
                    ELSE 999999
                END DESC
            '),
            'name' => $query->orderBy('name', $sortOrder),
            'newest' => $query->orderByDesc('created_at'),
            'popularity' => $query->orderByDesc('purchase_count'),
            default => $query->orderBy('display_order', 'asc'),
        };

        $perPage = min($request->per_page ?? 12, 50);
        $bundles = $query->paginate($perPage);

        return $this->paginated($bundles, BundleResource::class);
    }

    /**
     * Get bundles for homepage display
     */
    public function homepage(Request $request)
    {
        try {
            $bundles = Bundle::with(['items.product.images', 'slots.availableProducts.images', 'images'])
                ->homepage()
                ->get();

            $grouped = [
                'carousel' => BundleResource::collection($bundles->where('homepage_position', 'carousel')->values()),
                'grid' => BundleResource::collection($bundles->where('homepage_position', 'grid')->values()),
                'banner' => BundleResource::collection($bundles->where('homepage_position', 'banner')->values()),
            ];

            return $this->success($grouped);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Bundle homepage error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty data instead of 500 error
            return $this->success([
                'carousel' => [],
                'grid' => [],
                'banner' => [],
            ]);
        }
    }

    /**
     * Get a single bundle by slug
     */
    public function show(string $slug)
    {
        $bundle = Bundle::with([
            'items.product.images',
            'slots.products.product.images',
            'slots.availableProducts.images',
            'images',
        ])
        ->where('slug', $slug)
        ->available()
        ->firstOrFail();

        // Track view
        $bundle->incrementViewCount();

        return $this->success(new BundleResource($bundle));
    }

    /**
     * Calculate price for a bundle with selections (configurable bundles)
     */
    public function calculate(Request $request, string $slug)
    {
        $bundle = Bundle::where('slug', $slug)->available()->firstOrFail();

        $selections = $request->input('selections', []);

        // Validate selections for configurable bundles
        if ($bundle->isConfigurable()) {
            $errors = $this->pricingService->validateSelections($bundle, $selections);
            if (!empty($errors)) {
                return $this->error('Invalid selections', 422, $errors);
            }
        }

        $pricing = $this->pricingService->getPricingBreakdown($bundle, $selections);

        return $this->success($pricing);
    }

    /**
     * Add bundle to cart
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'bundle_slug' => 'required|string|exists:bundles,slug',
            'selections' => 'nullable|array',
            'selections.*.slot_id' => 'required_with:selections|integer',
            'selections.*.product_id' => 'nullable|integer',
            'selections.*.product_ids' => 'nullable|array',
        ]);

        $bundle = Bundle::where('slug', $request->bundle_slug)->available()->firstOrFail();

        // Get or create cart
        $cart = $this->getOrCreateCart($request);

        $result = $this->cartService->addBundleToCart($cart, $bundle, $request->selections);

        if (!$result['success']) {
            return $this->error($result['message'], 422, $result['errors'] ?? null);
        }

        // Load cart with relationships for response
        $cart->load(['items.product.images', 'items.bundle']);

        return $this->success([
            'message' => $result['message'],
            'cart' => $cart,
        ]);
    }

    /**
     * Get related bundles
     */
    public function related(string $slug)
    {
        $bundle = Bundle::where('slug', $slug)->firstOrFail();

        // Get related bundles (same type or overlapping products)
        $relatedBundles = Bundle::with(['items.product.images', 'images'])
            ->available()
            ->where('id', '!=', $bundle->id)
            ->orderByDesc('purchase_count')
            ->limit(4)
            ->get();

        return $this->success(BundleResource::collection($relatedBundles));
    }

    /**
     * Get or create a cart for the current user/session
     */
    protected function getOrCreateCart(Request $request): Cart
    {
        $userId = auth()->id();
        $sessionId = $request->session_id ?? session()->getId();

        if ($userId) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);

            // Merge session cart if exists
            if ($sessionId) {
                $sessionCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($sessionCart) {
                    foreach ($sessionCart->items as $item) {
                        $existingItem = $cart->items()
                            ->where('product_id', $item->product_id)
                            ->where('product_variant_id', $item->product_variant_id)
                            ->whereNull('bundle_id')
                            ->first();

                        if ($existingItem) {
                            $existingItem->increment('quantity', $item->quantity);
                        } else {
                            $item->update(['cart_id' => $cart->id]);
                        }
                    }
                    $sessionCart->delete();
                }
            }
        } else {
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }

        return $cart;
    }
}
