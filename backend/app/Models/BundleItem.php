<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BundleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_id',
        'product_id',
        'quantity',
        'price_override',
        'sort_order',
    ];

    protected $casts = [
        'price_override' => 'decimal:2',
    ];

    // Relationships
    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getEffectivePriceAttribute(): float
    {
        if ($this->price_override !== null) {
            return $this->price_override;
        }

        return $this->product?->price ?? 0;
    }

    public function getLineTotalAttribute(): float
    {
        return $this->effective_price * $this->quantity;
    }
}
