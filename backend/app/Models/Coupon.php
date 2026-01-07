<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_order_amount',
        'maximum_discount',
        'usage_limit',
        'usage_limit_per_user',
        'times_used',
        'applicable_categories',
        'applicable_products',
        'excluded_products',
        'is_active',
        'first_order_only',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
        'excluded_products' => 'array',
        'is_active' => 'boolean',
        'first_order_only' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereColumn('times_used', '<', 'usage_limit');
            });
    }

    public function scopeCode($query, $code)
    {
        return $query->where('code', strtoupper($code));
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isStarted(): bool
    {
        return !$this->starts_at || $this->starts_at->isPast();
    }

    public function hasReachedUsageLimit(): bool
    {
        return $this->usage_limit && $this->times_used >= $this->usage_limit;
    }

    public function hasUserReachedLimit(?int $userId): bool
    {
        if (!$userId || !$this->usage_limit_per_user) {
            return false;
        }

        return $this->usages()->where('user_id', $userId)->count() >= $this->usage_limit_per_user;
    }

    public function validateForCart(Cart $cart, ?int $userId = null): array
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'This coupon is not active'];
        }

        if (!$this->isStarted()) {
            return ['valid' => false, 'message' => 'This coupon is not yet active'];
        }

        if ($this->isExpired()) {
            return ['valid' => false, 'message' => 'This coupon has expired'];
        }

        if ($this->hasReachedUsageLimit()) {
            return ['valid' => false, 'message' => 'This coupon has reached its usage limit'];
        }

        if ($this->hasUserReachedLimit($userId)) {
            return ['valid' => false, 'message' => 'You have already used this coupon'];
        }

        if ($this->minimum_order_amount && $cart->subtotal < $this->minimum_order_amount) {
            return [
                'valid' => false,
                'message' => "Minimum order amount is Rs. {$this->minimum_order_amount}"
            ];
        }

        if ($this->first_order_only && $userId) {
            $hasOrders = Order::where('user_id', $userId)
                ->whereNotIn('status', ['cancelled', 'refunded'])
                ->exists();
            if ($hasOrders) {
                return ['valid' => false, 'message' => 'This coupon is only valid for first orders'];
            }
        }

        return ['valid' => true, 'message' => 'Coupon is valid'];
    }

    public function calculateDiscount(float $subtotal): float
    {
        $discount = match ($this->type) {
            'percentage' => $subtotal * ($this->value / 100),
            'fixed' => $this->value,
            'free_shipping' => 0, // Handled separately
            default => 0,
        };

        if ($this->maximum_discount && $discount > $this->maximum_discount) {
            $discount = $this->maximum_discount;
        }

        return min($discount, $subtotal);
    }

    public function recordUsage(Order $order, ?int $userId = null, float $discountAmount = 0): void
    {
        $this->usages()->create([
            'user_id' => $userId,
            'order_id' => $order->id,
            'discount_amount' => $discountAmount,
        ]);

        $this->increment('times_used');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($coupon) {
            $coupon->code = strtoupper($coupon->code);
        });

        static::updating(function ($coupon) {
            $coupon->code = strtoupper($coupon->code);
        });
    }
}
