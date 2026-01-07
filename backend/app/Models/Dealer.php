<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dealer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'business_name',
        'contact_person',
        'email',
        'phone',
        'alternate_phone',
        'city',
        'address',
        'ntn_number',
        'strn_number',
        'established_year',
        'business_type',
        'current_brands',
        'additional_details',
        'status',
        'credit_limit',
        'current_credit',
        'discount_percentage',
        'admin_notes',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'current_credit' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DealerDocument::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeCity($query, $city)
    {
        return $query->where('city', $city);
    }

    // Methods
    public function approve(int $approvedBy): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
        ]);

        // Grant dealer role to user if exists
        if ($this->user) {
            $this->user->assignRole('dealer');
        }
    }

    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'admin_notes' => $reason,
        ]);
    }

    public function suspend(string $reason = null): void
    {
        $this->update([
            'status' => 'suspended',
            'admin_notes' => $reason,
        ]);

        if ($this->user) {
            $this->user->removeRole('dealer');
        }
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function hasAvailableCredit(float $amount): bool
    {
        if ($this->credit_limit <= 0) {
            return true; // No credit limit set
        }

        return ($this->credit_limit - $this->current_credit) >= $amount;
    }

    public function useCredit(float $amount): void
    {
        $this->increment('current_credit', $amount);
    }

    public function repayCredit(float $amount): void
    {
        $this->decrement('current_credit', min($amount, $this->current_credit));
    }

    public function getAvailableCreditAttribute(): float
    {
        return max(0, $this->credit_limit - $this->current_credit);
    }

    public function getBusinessTypeLabelAttribute(): string
    {
        return match ($this->business_type) {
            'electronics_store' => 'Electronics Store',
            'multibrand_retail' => 'Multi-brand Retail',
            'ecommerce' => 'E-commerce',
            'distributor' => 'Distributor',
            'other' => 'Other',
            default => ucfirst($this->business_type),
        };
    }
}
