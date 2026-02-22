<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBundleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
        ];
    }
}
