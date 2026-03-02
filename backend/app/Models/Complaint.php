<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    protected $fillable = [
        'complaint_number',
        'complainant_type',
        'customer_id',
        'online_order_id',
        'b2b_order_id',
        'complainant_name',
        'complainant_phone',
        'complainant_city',
        'dealer_purchased_from',
        'purchase_channel',
        'approx_purchase_month',
        'approx_purchase_year',
        'product_id',
        'sku_manual',
        'product_name_manual',
        'serial_number',
        'complaint_category',
        'description',
        'status',
        'assigned_to',
        'resolved_at',
        'resolution_notes',
        'filed_by_id',
        'filed_by_type',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Complaint $complaint): void {
            if (empty($complaint->complaint_number)) {
                $complaint->complaint_number = static::generateComplaintNumber();
            }
        });
    }

    public static function generateComplaintNumber(): string
    {
        $year = now()->year;
        $prefix = "CPL-{$year}-";

        $last = static::whereYear('created_at', $year)
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        if ($last && preg_match('/CPL-\d{4}-(\d{5})/', $last->complaint_number, $matches)) {
            $nextSequence = (int) $matches[1] + 1;
        } else {
            $nextSequence = 1;
        }

        return $prefix . str_pad($nextSequence, 5, '0', STR_PAD_LEFT);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function onlineOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'online_order_id');
    }

    public function b2bOrder(): BelongsTo
    {
        return $this->belongsTo(B2bOrder::class, 'b2b_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function filedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'filed_by_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ComplaintAttachment::class, 'complaint_id');
    }

    public function activityLog(): HasMany
    {
        return $this->hasMany(ComplaintActivityLog::class, 'complaint_id')->orderByDesc('created_at');
    }
}
