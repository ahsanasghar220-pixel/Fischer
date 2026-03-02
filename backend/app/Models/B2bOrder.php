<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class B2bOrder extends Model
{
    protected $fillable = [
        'order_number',
        'salesperson_id',
        'dealer_name',
        'city',
        'brand_name',
        'status',
        'delivery_estimate',
        'remarks',
    ];

    protected $casts = [
        'delivery_estimate' => 'date',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (B2bOrder $order): void {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $prefix = "ORD-{$year}-";

        $last = static::whereYear('created_at', $year)
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        if ($last && preg_match('/ORD-\d{4}-(\d{5})/', $last->order_number, $matches)) {
            $nextSequence = (int) $matches[1] + 1;
        } else {
            $nextSequence = 1;
        }

        return $prefix . str_pad($nextSequence, 5, '0', STR_PAD_LEFT);
    }

    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'salesperson_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(B2bOrderItem::class, 'b2b_order_id');
    }
}
