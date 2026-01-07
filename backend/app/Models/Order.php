<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'user_id',
        'dealer_id',
        'guest_email',
        'guest_phone',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id',
        'paid_at',
        'subtotal',
        'discount_amount',
        'shipping_amount',
        'tax_amount',
        'total',
        'shipping_first_name',
        'shipping_last_name',
        'shipping_phone',
        'shipping_email',
        'shipping_address_line_1',
        'shipping_address_line_2',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'same_billing_address',
        'billing_first_name',
        'billing_last_name',
        'billing_phone',
        'billing_address_line_1',
        'billing_address_line_2',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',
        'shipping_method',
        'tracking_number',
        'courier_name',
        'shipped_at',
        'delivered_at',
        'coupon_code',
        'coupon_id',
        'loyalty_points_earned',
        'loyalty_points_used',
        'loyalty_discount',
        'customer_notes',
        'admin_notes',
        'source',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'loyalty_discount' => 'decimal:2',
        'same_billing_address' => 'boolean',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected $appends = ['shipping_full_name', 'shipping_full_address', 'items_count'];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dealer(): BelongsTo
    {
        return $this->belongsTo(Dealer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('created_at');
    }

    // Scopes
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeRecent($query)
    {
        return $query->orderByDesc('created_at');
    }

    public function scopeDateRange($query, $from, $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    // Accessors
    public function getShippingFullNameAttribute(): string
    {
        return "{$this->shipping_first_name} {$this->shipping_last_name}";
    }

    public function getShippingFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->shipping_address_line_1,
            $this->shipping_address_line_2,
            $this->shipping_city,
            $this->shipping_state,
            $this->shipping_postal_code,
            $this->shipping_country,
        ]);

        return implode(', ', $parts);
    }

    public function getItemsCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    // Methods
    public static function generateOrderNumber(): string
    {
        $prefix = 'FSC';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));

        return "{$prefix}-{$date}-{$random}";
    }

    public function updateStatus(string $status, ?string $notes = null, ?int $changedBy = null): void
    {
        $previousStatus = $this->status;

        $this->update(['status' => $status]);

        $this->statusHistory()->create([
            'status' => $status,
            'previous_status' => $previousStatus,
            'notes' => $notes,
            'changed_by' => $changedBy,
        ]);

        // Update timestamps
        if ($status === 'shipped' && !$this->shipped_at) {
            $this->update(['shipped_at' => now()]);
        }

        if ($status === 'delivered' && !$this->delivered_at) {
            $this->update(['delivered_at' => now()]);
        }
    }

    public function markAsPaid(string $transactionId = null): void
    {
        $this->update([
            'payment_status' => 'paid',
            'transaction_id' => $transactionId,
            'paid_at' => now(),
        ]);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed', 'processing']);
    }

    public function canBeRefunded(): bool
    {
        return $this->payment_status === 'paid' && in_array($this->status, ['delivered', 'returned']);
    }

    public function getCustomerEmail(): ?string
    {
        return $this->user?->email ?? $this->guest_email ?? $this->shipping_email;
    }

    public function getCustomerPhone(): ?string
    {
        return $this->user?->phone ?? $this->guest_phone ?? $this->shipping_phone;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });

        static::created(function ($order) {
            $order->statusHistory()->create([
                'status' => $order->status,
                'notes' => 'Order created',
            ]);
        });
    }
}
