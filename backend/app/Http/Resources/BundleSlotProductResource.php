<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BundleSlotProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bundle_slot_id' => $this->bundle_slot_id,
            'product_id' => $this->product_id,
            'price_override' => $this->price_override ? (float) $this->price_override : null,
            'effective_price' => (float) $this->effective_price,
            'product' => $this->when($this->relationLoaded('product'), fn() => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'price' => (float) $this->product->price,
                'image' => $this->product->primary_image,
                'is_in_stock' => $this->product->is_in_stock,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
