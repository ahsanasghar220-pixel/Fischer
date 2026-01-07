<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_code',
    ];

    protected $appends = ['subtotal', 'items_count', 'total_weight'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'coupon_code', 'code');
    }

    // Accessors
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });
    }

    public function getItemsCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    public function getTotalWeightAttribute(): float
    {
        return $this->items->sum(function ($item) {
            $weight = $item->productVariant?->weight ?? $item->product->weight ?? 0;
            return $item->quantity * $weight;
        });
    }

    // Methods
    public function addItem(Product $product, int $quantity = 1, ?ProductVariant $variant = null): CartItem
    {
        $existingItem = $this->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $quantity);
            return $existingItem->fresh();
        }

        return $this->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'quantity' => $quantity,
        ]);
    }

    public function updateItemQuantity(int $itemId, int $quantity): ?CartItem
    {
        $item = $this->items()->find($itemId);

        if (!$item) {
            return null;
        }

        if ($quantity <= 0) {
            $item->delete();
            return null;
        }

        $item->update(['quantity' => $quantity]);
        return $item->fresh();
    }

    public function removeItem(int $itemId): bool
    {
        return $this->items()->where('id', $itemId)->delete() > 0;
    }

    public function clear(): void
    {
        $this->items()->delete();
        $this->update(['coupon_code' => null]);
    }

    public function applyCoupon(string $code): array
    {
        $coupon = Coupon::where('code', $code)->active()->first();

        if (!$coupon) {
            return ['success' => false, 'message' => 'Invalid coupon code'];
        }

        $validation = $coupon->validateForCart($this);

        if (!$validation['valid']) {
            return ['success' => false, 'message' => $validation['message']];
        }

        $this->update(['coupon_code' => $code]);

        return [
            'success' => true,
            'message' => 'Coupon applied successfully',
            'discount' => $coupon->calculateDiscount($this->subtotal),
        ];
    }

    public function removeCoupon(): void
    {
        $this->update(['coupon_code' => null]);
    }

    public function getDiscount(): float
    {
        if (!$this->coupon_code) {
            return 0;
        }

        $coupon = Coupon::where('code', $this->coupon_code)->active()->first();

        return $coupon ? $coupon->calculateDiscount($this->subtotal) : 0;
    }

    public function mergeFromSession(string $sessionId): void
    {
        $sessionCart = self::where('session_id', $sessionId)->first();

        if (!$sessionCart) {
            return;
        }

        foreach ($sessionCart->items as $item) {
            $this->addItem(
                $item->product,
                $item->quantity,
                $item->productVariant
            );
        }

        $sessionCart->delete();
    }

    public static function getOrCreate(?int $userId = null, ?string $sessionId = null): self
    {
        if ($userId) {
            return self::firstOrCreate(['user_id' => $userId]);
        }

        if ($sessionId) {
            return self::firstOrCreate(['session_id' => $sessionId]);
        }

        throw new \InvalidArgumentException('Either userId or sessionId must be provided');
    }
}
