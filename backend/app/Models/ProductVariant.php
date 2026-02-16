<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',
        'compare_price',
        'dealer_price',
        'stock_quantity',
        'weight',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'dealer_price' => 'decimal:2',
        'weight' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    protected $appends = ['attribute_values_formatted', 'stock'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variant_attribute_values',
            'product_variant_id',
            'attribute_value_id'
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function getAttributeValuesFormattedAttribute(): array
    {
        return $this->attributeValues->map(function ($value) {
            return [
                'attribute' => $value->attribute->name,
                'value' => $value->value,
                'color_code' => $value->color_code,
            ];
        })->toArray();
    }

    public function getStockAttribute(): int
    {
        return $this->stock_quantity ?? 0;
    }

    public function getEffectivePrice(): float
    {
        return $this->price ?? $this->product->price;
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0 || $this->product->allow_backorders;
    }

    public function updateStock(int $quantity, string $operation = 'decrement'): void
    {
        if ($operation === 'decrement') {
            // Prevent negative stock if inventory tracking is enabled and backorders not allowed
            if ($this->product->track_inventory && !$this->product->allow_backorders) {
                if ($this->stock_quantity < $quantity) {
                    throw new \Exception("Insufficient stock for variant '{$this->name}' of '{$this->product->name}'. Available: {$this->stock_quantity}, Requested: {$quantity}");
                }
            }
            $this->decrement('stock_quantity', $quantity);
        } else {
            $this->increment('stock_quantity', $quantity);
        }
    }
}
