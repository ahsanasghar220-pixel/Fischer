<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'product_variant_id',
        'bundle_id',
        'bundle_slot_selections',
        'is_bundle_item',
        'parent_cart_item_id',
        'quantity',
    ];

    protected $casts = [
        'bundle_slot_selections' => 'array',
        'is_bundle_item' => 'boolean',
    ];

    protected $appends = ['unit_price', 'total_price', 'is_available'];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class);
    }

    public function parentCartItem(): BelongsTo
    {
        return $this->belongsTo(CartItem::class, 'parent_cart_item_id');
    }

    // Accessors
    public function getUnitPriceAttribute(): float
    {
        if ($this->product_variant_id && $this->productVariant?->price) {
            return $this->productVariant->price;
        }

        return $this->product->price;
    }

    public function getTotalPriceAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }

    public function getIsAvailableAttribute(): bool
    {
        if (!$this->product || !$this->product->is_active) {
            return false;
        }

        if ($this->product_variant_id) {
            $variant = $this->productVariant;
            if (!$variant || !$variant->is_active) {
                return false;
            }
            return $variant->stock_quantity >= $this->quantity || $this->product->allow_backorders;
        }

        return $this->product->stock_quantity >= $this->quantity || $this->product->allow_backorders;
    }

    public function getMaxQuantityAttribute(): int
    {
        if ($this->product_variant_id) {
            return $this->productVariant?->stock_quantity ?? 0;
        }

        return $this->product->stock_quantity;
    }

    public function getVariantInfoAttribute(): ?array
    {
        if (!$this->product_variant_id) {
            return null;
        }

        return $this->productVariant?->attribute_values_formatted;
    }
}
