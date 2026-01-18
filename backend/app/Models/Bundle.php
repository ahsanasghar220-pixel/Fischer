<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Carbon\Carbon;

class Bundle extends Model
{
    use HasFactory, SoftDeletes, HasSlug;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'discount_type',
        'discount_value',
        'badge_label',
        'badge_color',
        'theme_color',
        'featured_image',
        'gallery_images',
        'video_url',
        'is_active',
        'starts_at',
        'ends_at',
        'stock_limit',
        'stock_sold',
        'bundle_type',
        'cart_display',
        'allow_coupon_stacking',
        'show_on_homepage',
        'homepage_position',
        'display_order',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'cta_text',
        'show_countdown',
        'show_savings',
        'view_count',
        'add_to_cart_count',
        'purchase_count',
        'revenue',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'meta_keywords' => 'array',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'allow_coupon_stacking' => 'boolean',
        'show_on_homepage' => 'boolean',
        'show_countdown' => 'boolean',
        'show_savings' => 'boolean',
        'discount_value' => 'decimal:2',
        'revenue' => 'decimal:2',
    ];

    protected $appends = ['is_available', 'time_remaining', 'stock_remaining'];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    // Relationships
    public function items(): HasMany
    {
        return $this->hasMany(BundleItem::class)->orderBy('sort_order');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(BundleSlot::class)->orderBy('slot_order');
    }

    public function images(): HasMany
    {
        return $this->hasMany(BundleImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(BundleImage::class)->where('is_primary', true);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'bundle_items')
            ->withPivot(['quantity', 'price_override', 'sort_order'])
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        $now = Carbon::now();
        return $query->active()
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $now);
            })
            ->where(function ($q) {
                $q->whereNull('stock_limit')
                    ->orWhereRaw('stock_sold < stock_limit');
            });
    }

    public function scopeHomepage($query)
    {
        return $query->available()
            ->where('show_on_homepage', true)
            ->orderBy('display_order');
    }

    public function scopeByPosition($query, string $position)
    {
        return $query->where('homepage_position', $position);
    }

    public function scopeFixed($query)
    {
        return $query->where('bundle_type', 'fixed');
    }

    public function scopeConfigurable($query)
    {
        return $query->where('bundle_type', 'configurable');
    }

    // Accessors
    public function getIsAvailableAttribute(): bool
    {
        $now = Carbon::now();

        if (!$this->is_active) {
            return false;
        }

        if ($this->starts_at && $this->starts_at > $now) {
            return false;
        }

        if ($this->ends_at && $this->ends_at < $now) {
            return false;
        }

        if ($this->stock_limit !== null && $this->stock_sold >= $this->stock_limit) {
            return false;
        }

        return true;
    }

    public function getTimeRemainingAttribute(): ?array
    {
        if (!$this->ends_at || !$this->show_countdown) {
            return null;
        }

        $now = Carbon::now();
        if ($this->ends_at < $now) {
            return null;
        }

        $diff = $now->diff($this->ends_at);

        return [
            'days' => $diff->days,
            'hours' => $diff->h,
            'minutes' => $diff->i,
            'seconds' => $diff->s,
            'total_seconds' => $this->ends_at->diffInSeconds($now),
        ];
    }

    public function getStockRemainingAttribute(): ?int
    {
        if ($this->stock_limit === null) {
            return null;
        }

        return max(0, $this->stock_limit - $this->stock_sold);
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if ($this->featured_image) {
            return $this->featured_image;
        }

        $primary = $this->images->firstWhere('is_primary', true);
        return $primary ? $primary->image : ($this->images->first()?->image);
    }

    // Methods
    public function isFixed(): bool
    {
        return $this->bundle_type === 'fixed';
    }

    public function isConfigurable(): bool
    {
        return $this->bundle_type === 'configurable';
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function incrementAddToCartCount(): void
    {
        $this->increment('add_to_cart_count');
    }

    public function incrementPurchaseCount(): void
    {
        $this->increment('purchase_count');
        $this->increment('stock_sold');
    }

    public function addRevenue(float $amount): void
    {
        $this->increment('revenue', $amount);
    }

    public function getConversionRate(): float
    {
        $viewCount = (int) ($this->view_count ?? 0);
        $purchaseCount = (int) ($this->purchase_count ?? 0);

        if ($viewCount === 0) {
            return 0.0;
        }

        return round(($purchaseCount / $viewCount) * 100, 2);
    }

    public function getAddToCartRate(): float
    {
        $viewCount = (int) ($this->view_count ?? 0);
        $addToCartCount = (int) ($this->add_to_cart_count ?? 0);

        if ($viewCount === 0) {
            return 0.0;
        }

        return round(($addToCartCount / $viewCount) * 100, 2);
    }

    public function duplicate(): self
    {
        $clone = $this->replicate(['slug', 'sku', 'view_count', 'add_to_cart_count', 'purchase_count', 'revenue', 'stock_sold']);
        $clone->name = $this->name . ' (Copy)';
        $clone->is_active = false;
        $clone->save();

        // Clone items for fixed bundles
        foreach ($this->items as $item) {
            $clone->items()->create($item->only(['product_id', 'quantity', 'price_override', 'sort_order']));
        }

        // Clone slots for configurable bundles
        foreach ($this->slots as $slot) {
            $newSlot = $clone->slots()->create($slot->only(['name', 'description', 'slot_order', 'is_required', 'min_selections', 'max_selections']));

            foreach ($slot->products as $slotProduct) {
                $newSlot->products()->create([
                    'product_id' => $slotProduct->product_id,
                    'price_override' => $slotProduct->price_override,
                ]);
            }
        }

        // Clone images
        foreach ($this->images as $image) {
            $clone->images()->create($image->only(['image', 'alt_text', 'is_primary', 'sort_order']));
        }

        return $clone;
    }
}
