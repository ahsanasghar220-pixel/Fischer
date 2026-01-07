<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'product_sku',
        'product_image',
        'variant_attributes',
        'quantity',
        'unit_price',
        'total_price',
        'discount_amount',
        'quantity_returned',
        'refund_amount',
    ];

    protected $casts = [
        'variant_attributes' => 'array',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function getVariantNameAttribute(): ?string
    {
        if (!$this->variant_attributes) {
            return null;
        }

        return collect($this->variant_attributes)
            ->map(fn($value, $key) => "{$key}: {$value}")
            ->implode(', ');
    }

    public function canReturn(int $quantity = null): bool
    {
        $quantity = $quantity ?? 1;
        return ($this->quantity - $this->quantity_returned) >= $quantity;
    }

    public function processReturn(int $quantity, float $refundAmount): void
    {
        $this->increment('quantity_returned', $quantity);
        $this->increment('refund_amount', $refundAmount);

        // Restore stock
        if ($this->product_variant_id) {
            $this->productVariant?->updateStock($quantity, 'increment');
        } else {
            $this->product?->updateStock($quantity, 'increment');
        }
    }
}
