<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionInventory extends Model
{
    protected $table = 'production_inventory';

    protected $fillable = [
        'product_id',
        'sku',
        'product_name',
        'quantity_available',
        'quantity_in_production',
        'last_updated_by',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_updated_by');
    }
}
