<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasSlug;

    protected $hidden = ['deleted_at'];

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'model_number',
        'short_description',
        'description',
        'price',
        'compare_price',
        'cost_price',
        'dealer_price',
        'stock_quantity',
        'low_stock_threshold',
        'weight',
        'dimensions',
        'stock_status',
        'is_active',
        'is_featured',
        'is_new',
        'is_bestseller',
        'track_inventory',
        'allow_backorders',
        'has_variants',
        'warranty_period',
        'specifications',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'dealer_price' => 'decimal:2',
        'weight' => 'decimal:3',
        'dimensions' => 'array',
        'specifications' => 'array',
        'meta_keywords' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'is_bestseller' => 'boolean',
        'track_inventory' => 'boolean',
        'allow_backorders' => 'boolean',
        'has_variants' => 'boolean',
        'average_rating' => 'decimal:2',
    ];

    protected $appends = ['primary_image', 'discount_percentage', 'is_in_stock'];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants(): HasMany
    {
        return $this->variants()->where('is_active', true);
    }

    public function attributes(): BelongsToMany
    {
        return $this->belongsToMany(Attribute::class, 'product_attributes');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('status', 'approved');
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeNew($query)
    {
        return $query->where('is_new', true);
    }

    public function scopeBestseller($query)
    {
        return $query->where('is_bestseller', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_status', 'in_stock');
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%")
              ->orWhere('short_description', 'like', "%{$term}%")
              ->orWhere('model_number', 'like', "%{$term}%");
        });
    }

    public function scopePriceRange($query, $min, $max)
    {
        if ($min) {
            $query->where('price', '>=', $min);
        }
        if ($max) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    // Accessors
    public function getPrimaryImageAttribute(): ?string
    {
        $primary = $this->images->firstWhere('is_primary', true);
        return $primary ? $primary->image : ($this->images->first()?->image);
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->compare_price || $this->compare_price <= $this->price) {
            return null;
        }

        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    public function getIsInStockAttribute(): bool
    {
        if ($this->has_variants) {
            if ($this->relationLoaded('variants')) {
                return $this->variants->where('is_active', true)->where('stock_quantity', '>', 0)->isNotEmpty();
            }
            return $this->activeVariants()->where('stock_quantity', '>', 0)->exists();
        }

        return $this->stock_status === 'in_stock' || ($this->allow_backorders && $this->stock_status === 'on_backorder');
    }

    public function getEffectivePrice(?int $variantId = null): float
    {
        if ($variantId && $this->has_variants) {
            $variant = $this->variants()->find($variantId);
            if ($variant && $variant->price) {
                return $variant->price;
            }
        }

        return $this->price;
    }

    public function getDealerPrice(?int $variantId = null): float
    {
        if ($variantId && $this->has_variants) {
            $variant = $this->variants()->find($variantId);
            if ($variant && $variant->dealer_price) {
                return $variant->dealer_price;
            }
        }

        return $this->dealer_price ?? $this->price;
    }

    // Methods
    public function updateStock(int $quantity, string $operation = 'decrement'): void
    {
        if ($operation === 'decrement') {
            $this->decrement('stock_quantity', $quantity);
        } else {
            $this->increment('stock_quantity', $quantity);
        }

        $this->updateStockStatus();
    }

    public function updateStockStatus(): void
    {
        if ($this->track_inventory) {
            if ($this->stock_quantity <= 0) {
                $this->stock_status = $this->allow_backorders ? 'on_backorder' : 'out_of_stock';
            } else {
                $this->stock_status = 'in_stock';
            }
            $this->save();
        }
    }

    public function updateRatingStats(): void
    {
        $reviews = $this->approvedReviews();

        $this->update([
            'average_rating' => round($reviews->avg('rating') ?? 0, 2),
            'review_count' => $reviews->count(),
        ]);
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function incrementSalesCount(int $quantity = 1): void
    {
        $this->increment('sales_count', $quantity);
    }

    public function isLowStock(): bool
    {
        return $this->track_inventory && $this->stock_quantity <= $this->low_stock_threshold;
    }

    public function getRelatedProducts(int $limit = 4)
    {
        return static::active()
            ->where('id', '!=', $this->id)
            ->where(function ($query) {
                $query->where('category_id', $this->category_id)
                    ->orWhere('brand_id', $this->brand_id);
            })
            ->orderByDesc('sales_count')
            ->limit($limit)
            ->get();
    }
}
