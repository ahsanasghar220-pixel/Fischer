<?php

namespace App\Http\Resources;

use App\Services\BundlePricingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BundleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Safely get pricing with fallback
        try {
            $pricingService = app(BundlePricingService::class);
            $pricing = $pricingService->getPricingBreakdown($this->resource);
        } catch (\Exception $e) {
            \Log::error('Bundle pricing error for bundle ' . $this->id . ': ' . $e->getMessage());
            $pricing = [
                'original_price' => 0,
                'discounted_price' => 0,
                'savings' => 0,
                'savings_percentage' => 0,
            ];
        }

        // Check if user is admin safely
        $isAdmin = false;
        try {
            $user = $request->user();
            $isAdmin = $user && method_exists($user, 'isAdmin') && $user->isAdmin();
        } catch (\Exception $e) {
            // Ignore
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'short_description' => $this->short_description,

            // Pricing
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'original_price' => $pricing['original_price'],
            'discounted_price' => $pricing['discounted_price'],
            'savings' => $pricing['savings'],
            'savings_percentage' => $pricing['savings_percentage'],

            // Display
            'badge_label' => $this->badge_label,
            'badge_color' => $this->badge_color,
            'theme_color' => $this->theme_color,

            // Media
            'featured_image' => $this->featured_image ?? $this->featured_image_url,
            'gallery_images' => $this->gallery_images,
            'video_url' => $this->video_url,
            'images' => BundleImageResource::collection($this->whenLoaded('images')),

            // Availability
            'is_active' => $this->is_active,
            'is_available' => $this->is_available,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'stock_limit' => $this->stock_limit,
            'stock_sold' => $this->stock_sold,
            'stock_remaining' => $this->stock_remaining,
            'time_remaining' => $this->time_remaining,

            // Configuration
            'bundle_type' => $this->bundle_type,
            'cart_display' => $this->cart_display,
            'allow_coupon_stacking' => $this->allow_coupon_stacking,

            // Display placement
            'show_on_homepage' => $this->show_on_homepage,
            'homepage_position' => $this->homepage_position,
            'display_order' => $this->display_order,

            // SEO
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,

            // Marketing
            'cta_text' => $this->cta_text,
            'show_countdown' => $this->show_countdown,
            'show_savings' => $this->show_savings,

            // Products
            'items' => BundleItemResource::collection($this->whenLoaded('items')),
            'slots' => BundleSlotResource::collection($this->whenLoaded('slots')),
            'products_preview' => $this->when(
                $this->relationLoaded('items') || $this->relationLoaded('slots'),
                fn() => $this->getProductsPreview()
            ),

            // Analytics (admin only) - use closures to defer method evaluation
            'view_count' => $this->when($isAdmin, fn() => $this->view_count ?? 0),
            'add_to_cart_count' => $this->when($isAdmin, fn() => $this->add_to_cart_count ?? 0),
            'purchase_count' => $this->when($isAdmin, fn() => $this->purchase_count ?? 0),
            'revenue' => $this->when($isAdmin, fn() => (float) ($this->revenue ?? 0)),
            'conversion_rate' => $this->when($isAdmin, fn() => $this->getConversionRate()),
            'add_to_cart_rate' => $this->when($isAdmin, fn() => $this->getAddToCartRate()),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    protected function getProductsPreview(): array
    {
        $products = [];

        if ($this->isFixed() && $this->relationLoaded('items')) {
            foreach ($this->items->take(4) as $item) {
                if ($item->product) {
                    $products[] = [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'image' => $item->product->primary_image,
                    ];
                }
            }
        } elseif ($this->isConfigurable() && $this->relationLoaded('slots')) {
            foreach ($this->slots->take(4) as $slot) {
                $firstProduct = $slot->availableProducts->first();
                if ($firstProduct) {
                    $products[] = [
                        'id' => $firstProduct->id,
                        'name' => $firstProduct->name,
                        'image' => $firstProduct->primary_image,
                    ];
                }
            }
        }

        return $products;
    }
}
