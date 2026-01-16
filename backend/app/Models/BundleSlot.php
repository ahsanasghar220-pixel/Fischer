<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BundleSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_id',
        'name',
        'description',
        'slot_order',
        'is_required',
        'min_selections',
        'max_selections',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    // Relationships
    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(BundleSlotProduct::class);
    }

    public function availableProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'bundle_slot_products')
            ->withPivot('price_override')
            ->withTimestamps();
    }

    // Methods
    public function allowsMultipleSelections(): bool
    {
        return $this->max_selections > 1;
    }

    public function validateSelections(array $productIds): bool
    {
        $count = count($productIds);

        if ($this->is_required && $count < $this->min_selections) {
            return false;
        }

        if ($count > $this->max_selections) {
            return false;
        }

        // Check if all selected products are valid for this slot
        $validProductIds = $this->products()->pluck('product_id')->toArray();
        foreach ($productIds as $productId) {
            if (!in_array($productId, $validProductIds)) {
                return false;
            }
        }

        return true;
    }

    public function getProductPrice(int $productId): ?float
    {
        $slotProduct = $this->products()->where('product_id', $productId)->first();

        if (!$slotProduct) {
            return null;
        }

        if ($slotProduct->price_override !== null) {
            return $slotProduct->price_override;
        }

        return Product::find($productId)?->price;
    }
}
