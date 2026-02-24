<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|max:100|unique:product_variants,sku',
            'price'          => 'nullable|numeric|min:0',
            'compare_price'  => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'is_active'      => 'boolean',
        ]);

        $variant = $product->variants()->create($validated);
        $product->update(['has_variants' => true]);

        return $this->success(['data' => $variant], 'Variant created', 201);
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'sku'            => 'sometimes|string|max:100|unique:product_variants,sku,' . $variant->id,
            'price'          => 'nullable|numeric|min:0',
            'compare_price'  => 'nullable|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'is_active'      => 'boolean',
        ]);

        $variant->update($validated);

        return $this->success(['data' => $variant->fresh()], 'Variant updated');
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        $variant->delete();

        if ($product->variants()->count() === 0) {
            $product->update(['has_variants' => false]);
        }

        return $this->success(null, 'Variant deleted');
    }
}
