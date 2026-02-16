<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'banner_image',
        'start_date',
        'end_date',
        'is_active',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function saleProducts(): HasMany
    {
        return $this->hasMany(SaleProduct::class)->orderBy('sort_order');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'sale_products')
            ->withPivot(['sale_price', 'sort_order'])
            ->orderByPivot('sort_order');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            });
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->slug)) {
                $sale->slug = Str::slug($sale->name);
                $originalSlug = $sale->slug;
                $count = 1;
                while (static::where('slug', $sale->slug)->exists()) {
                    $sale->slug = $originalSlug . '-' . $count++;
                }
            }
        });

        static::updating(function ($sale) {
            if ($sale->isDirty('name') && !$sale->isDirty('slug')) {
                $sale->slug = Str::slug($sale->name);
                $originalSlug = $sale->slug;
                $count = 1;
                while (static::where('slug', $sale->slug)->where('id', '!=', $sale->id)->exists()) {
                    $sale->slug = $originalSlug . '-' . $count++;
                }
            }
        });
    }
}
