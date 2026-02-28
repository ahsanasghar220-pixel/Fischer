<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    protected $fillable = [
        'name',
        'cities',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'cities' => 'array',
        'is_active' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingZoneRate::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function findByCity(string $city): ?self
    {
        return self::active()
            ->get()
            ->first(function ($zone) use ($city) {
                $cities = is_array($zone->cities) ? $zone->cities : [];
                return in_array(strtolower($city), array_map('strtolower', $cities));
            });
    }

    public function containsCity(string $city): bool
    {
        $cities = is_array($this->cities) ? $this->cities : [];
        return in_array(strtolower($city), array_map('strtolower', $cities));
    }
}
