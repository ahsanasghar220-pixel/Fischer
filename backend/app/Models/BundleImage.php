<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BundleImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_id',
        'image',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    // Relationships
    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class);
    }

    // Methods
    public function makePrimary(): void
    {
        // Remove primary from other images
        $this->bundle->images()->where('id', '!=', $this->id)->update(['is_primary' => false]);

        // Set this as primary
        $this->update(['is_primary' => true]);
    }
}
