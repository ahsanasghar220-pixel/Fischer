<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotableClient extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'website',
        'sort_order',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Scope: Order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Scope: Only visible clients
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope: Only clients with logos
     */
    public function scopeWithLogo($query)
    {
        return $query->whereNotNull('logo')->where('logo', '!=', '');
    }
}
