<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingZoneRate extends Model
{
    protected $fillable = [
        'shipping_zone_id',
        'shipping_method_id',
        'rate',
        'per_kg_rate',
        'free_shipping_threshold',
        'min_delivery_days',
        'max_delivery_days',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'per_kg_rate' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    public function method(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class, 'shipping_method_id');
    }
}
