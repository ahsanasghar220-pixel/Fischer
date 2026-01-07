<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealerDocument extends Model
{
    protected $fillable = [
        'dealer_id',
        'type',
        'name',
        'file',
    ];

    public function dealer(): BelongsTo
    {
        return $this->belongsTo(Dealer::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'cnic' => 'CNIC',
            'ntn' => 'NTN Certificate',
            'business_registration' => 'Business Registration',
            'other' => 'Other Document',
            default => ucfirst($this->type),
        };
    }
}
