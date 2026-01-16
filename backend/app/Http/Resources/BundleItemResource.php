<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BundleItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bundle_id' => $this->bundle_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'price_override' => $this->price_override ? (float) $this->price_override : null,
            'effective_price' => (float) $this->effective_price,
            'line_total' => (float) $this->line_total,
            'sort_order' => $this->sort_order,
            'product' => $this->when($this->relationLoaded('product'), fn() => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'sku' => $this->product->sku,
                'price' => (float) $this->product->price,
                'image' => $this->product->primary_image,
                'is_in_stock' => $this->product->is_in_stock,
                'short_description' => $this->product->short_description,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
