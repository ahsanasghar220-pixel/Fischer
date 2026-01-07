<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'user_id',
        'order_id',
        'rating',
        'title',
        'content',
        'pros',
        'cons',
        'status',
        'is_verified_purchase',
        'helpful_count',
    ];

    protected $casts = [
        'pros' => 'array',
        'cons' => 'array',
        'is_verified_purchase' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReviewImage::class);
    }

    public function helpfuls(): HasMany
    {
        return $this->hasMany(ReviewHelpful::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    public function approve(): void
    {
        $this->update(['status' => 'approved']);
        $this->product->updateRatingStats();
    }

    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }

    public function markHelpful(int $userId, bool $helpful = true): void
    {
        $existing = $this->helpfuls()->where('user_id', $userId)->first();

        if ($existing) {
            if ($existing->is_helpful !== $helpful) {
                $existing->update(['is_helpful' => $helpful]);
                $this->updateHelpfulCount();
            }
        } else {
            $this->helpfuls()->create([
                'user_id' => $userId,
                'is_helpful' => $helpful,
            ]);
            $this->updateHelpfulCount();
        }
    }

    public function updateHelpfulCount(): void
    {
        $this->update([
            'helpful_count' => $this->helpfuls()->where('is_helpful', true)->count(),
        ]);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($review) {
            if ($review->status === 'approved') {
                $review->product->updateRatingStats();
            }
        });

        static::deleted(function ($review) {
            $review->product->updateRatingStats();
        });
    }
}
