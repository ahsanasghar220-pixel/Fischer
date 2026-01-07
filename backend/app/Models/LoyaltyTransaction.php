<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LoyaltyTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'points',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeEarned($query)
    {
        return $query->where('type', 'earned');
    }

    public function scopeRedeemed($query)
    {
        return $query->where('type', 'redeemed');
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'earned' => 'Points Earned',
            'redeemed' => 'Points Redeemed',
            'expired' => 'Points Expired',
            'adjusted' => 'Points Adjusted',
            'referral_bonus' => 'Referral Bonus',
            default => ucfirst($this->type),
        };
    }
}
