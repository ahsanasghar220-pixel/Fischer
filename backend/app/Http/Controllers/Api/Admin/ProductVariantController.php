<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'                  => 'nullable|string|max:255',
            'sku'                   => 'required|string|max:100|unique:product_variants,sku',
            'price'                 => 'nullable|numeric|min:0',
            'compare_price'         => 'nullable|numeric|min:0',
            'dealer_price'          => 'nullable|numeric|min:0',
            'stock_quantity'        => 'required|integer|min:0',
            'is_active'             => 'boolean',
            'attribute_value_ids'   => 'nullable|array',
            'attribute_value_ids.*' => 'exists:attribute_values,id',
        ]);

        $variant = $product->variants()->create($validated);

        if (!empty($validated['attribute_value_ids'])) {
            $variant->attributeValues()->sync($validated['attribute_value_ids']);
        }

        $product->update(['has_variants' => true]);

        return $this->success(['data' => $variant->load('attributeValues.attribute')], 'Variant created', 201);
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        $validated = $request->validate([
            'name'                  => 'nullable|string|max:255',
            'sku'                   => 'sometimes|string|max:100|unique:product_variants,sku,' . $variant->id,
            'price'                 => 'nullable|numeric|min:0',
            'compare_price'         => 'nullable|numeric|min:0',
            'dealer_price'          => 'nullable|numeric|min:0',
            'stock_quantity'        => 'sometimes|integer|min:0',
            'is_active'             => 'boolean',
            'attribute_value_ids'   => 'nullable|array',
            'attribute_value_ids.*' => 'exists:attribute_values,id',
        ]);

        $variant->update($validated);

        if (array_key_exists('attribute_value_ids', $validated)) {
            $variant->attributeValues()->sync($validated['attribute_value_ids'] ?? []);
        }

        return $this->success(['data' => $variant->fresh()->load('attributeValues.attribute')], 'Variant updated');
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        $variant->delete();

        if ($product->variants()->count() === 0) {
            $product->update(['has_variants' => false]);
        }

        return $this->success(null, 'Variant deleted');
    }

    /**
     * Batch create/update variants from the configurator builder matrix.
     * Does NOT auto-delete variants absent from the list — admin deletes manually.
     */
    public function batchStore(Request $request, Product $product)
    {
        $request->validate([
            'variants'                         => 'required|array',
            'variants.*.id'                    => 'nullable|integer',
            'variants.*.sku'                   => 'required|string|max:100',
            'variants.*.name'                  => 'nullable|string|max:255',
            'variants.*.price'                 => 'nullable|numeric|min:0',
            'variants.*.compare_price'         => 'nullable|numeric|min:0',
            'variants.*.dealer_price'          => 'nullable|numeric|min:0',
            'variants.*.stock_quantity'        => 'required|integer|min:0',
            'variants.*.is_active'             => 'boolean',
            'variants.*.attribute_value_ids'   => 'nullable|array',
            'variants.*.attribute_value_ids.*' => 'exists:attribute_values,id',
        ]);

        DB::transaction(function () use ($request, $product) {
            foreach ($request->variants as $row) {
                $data = [
                    'sku'            => $row['sku'],
                    'name'           => $row['name'] ?? null,
                    'price'          => $row['price'] ?? null,
                    'compare_price'  => $row['compare_price'] ?? null,
                    'dealer_price'   => $row['dealer_price'] ?? null,
                    'stock_quantity' => $row['stock_quantity'] ?? 0,
                    'is_active'      => $row['is_active'] ?? true,
                ];

                if (!empty($row['id'])) {
                    $variant = ProductVariant::where('id', $row['id'])
                        ->where('product_id', $product->id)
                        ->first();
                    $variant ? $variant->update($data) : $variant = $product->variants()->create($data);
                } else {
                    $variant = ProductVariant::where('sku', $row['sku'])
                        ->where('product_id', $product->id)
                        ->first();
                    $variant ? $variant->update($data) : $variant = $product->variants()->create($data);
                }

                if (isset($row['attribute_value_ids'])) {
                    $variant->attributeValues()->sync($row['attribute_value_ids']);
                }
            }

            $product->update(['has_variants' => $product->variants()->count() > 0]);
        });

        return $this->success([
            'data' => $product->variants()->with('attributeValues.attribute')->get(),
        ], 'Variants saved');
    }

    /**
     * Sync which global attributes are assigned to this product.
     */
    public function syncAttributes(Request $request, Product $product)
    {
        $request->validate([
            'attribute_ids'   => 'required|array',
            'attribute_ids.*' => 'exists:attributes,id',
        ]);

        $product->attributes()->sync($request->attribute_ids);

        return $this->success([
            'data' => $product->attributes()->with('values')->get(),
        ], 'Attributes synced');
    }
}
