<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingMethod extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'calculation_type',
        'base_cost',
        'per_kg_cost',
        'per_item_cost',
        'free_shipping_threshold',
        'min_delivery_days',
        'max_delivery_days',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'per_kg_cost' => 'decimal:2',
        'per_item_cost' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function zoneRates(): HasMany
    {
        return $this->hasMany(ShippingZoneRate::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    public function calculateCost(float $subtotal, float $weight, int $itemCount, ?ShippingZone $zone = null): float
    {
        // Check for free shipping
        if ($this->free_shipping_threshold && $subtotal >= $this->free_shipping_threshold) {
            return 0;
        }

        // Check for zone-specific rates
        if ($zone) {
            $zoneRate = $this->zoneRates()->where('shipping_zone_id', $zone->id)->first();
            if ($zoneRate) {
                if ($zoneRate->free_shipping_threshold && $subtotal >= $zoneRate->free_shipping_threshold) {
                    return 0;
                }

                $cost = $zoneRate->rate;
                if ($zoneRate->per_kg_rate && $weight > 0) {
                    $cost += $weight * $zoneRate->per_kg_rate;
                }
                return $cost;
            }
        }

        // Default calculation
        return match ($this->calculation_type) {
            'flat' => $this->base_cost,
            'weight' => $this->base_cost + ($weight * $this->per_kg_cost),
            'price' => $subtotal * ($this->base_cost / 100), // Base cost as percentage
            'item' => $this->base_cost + ($itemCount * $this->per_item_cost),
            default => $this->base_cost,
        };
    }

    public function getEstimatedDelivery(?ShippingZone $zone = null): string
    {
        $min = $this->min_delivery_days;
        $max = $this->max_delivery_days;

        if ($zone) {
            $zoneRate = $this->zoneRates()->where('shipping_zone_id', $zone->id)->first();
            if ($zoneRate) {
                $min = $zoneRate->min_delivery_days ?? $min;
                $max = $zoneRate->max_delivery_days ?? $max;
            }
        }

        if ($min === $max) {
            return "{$min} day" . ($min > 1 ? 's' : '');
        }

        return "{$min}-{$max} days";
    }
}
