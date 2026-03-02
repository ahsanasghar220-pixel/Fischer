<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B2bOrderItem extends Model
{
    protected $fillable = [
        'b2b_order_id',
        'product_id',
        'sku',
        'product_name',
        'quantity',
        'notes',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(B2bOrder::class, 'b2b_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
