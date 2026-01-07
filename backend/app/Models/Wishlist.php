<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wishlist extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public static function toggle(int $userId, int $productId): array
    {
        $existing = self::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return ['added' => false, 'message' => 'Removed from wishlist'];
        }

        self::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return ['added' => true, 'message' => 'Added to wishlist'];
    }
}
