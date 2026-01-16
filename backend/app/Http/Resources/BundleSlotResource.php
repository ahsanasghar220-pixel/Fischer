<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BundleSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bundle_id' => $this->bundle_id,
            'name' => $this->name,
            'description' => $this->description,
            'slot_order' => $this->slot_order,
            'is_required' => $this->is_required,
            'min_selections' => $this->min_selections,
            'max_selections' => $this->max_selections,
            'allows_multiple' => $this->allowsMultipleSelections(),
            'products' => BundleSlotProductResource::collection($this->whenLoaded('products')),
            'available_products' => $this->when(
                $this->relationLoaded('availableProducts'),
                fn() => $this->availableProducts->map(fn($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'price_override' => $product->pivot?->price_override ? (float) $product->pivot->price_override : null,
                    'effective_price' => (float) ($product->pivot?->price_override ?? $product->price),
                    'image' => $product->primary_image,
                    'is_in_stock' => $product->is_in_stock,
                ])
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
