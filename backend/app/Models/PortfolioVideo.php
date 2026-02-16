<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioVideo extends Model
{
    protected $fillable = [
        'title',
        'description',
        'video_url',
        'thumbnail',
        'category',
        'sort_order',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
