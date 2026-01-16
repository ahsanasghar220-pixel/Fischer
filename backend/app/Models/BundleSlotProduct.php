<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BundleSlotProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_slot_id',
        'product_id',
        'price_override',
    ];

    protected $casts = [
        'price_override' => 'decimal:2',
    ];

    // Relationships
    public function slot(): BelongsTo
    {
        return $this->belongsTo(BundleSlot::class, 'bundle_slot_id');
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
}
