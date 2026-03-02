<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreB2BOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dealer_name'          => 'required|string|max:255',
            'city'                 => 'required|string|max:100',
            'brand_name'           => 'required|in:Fischer,OEM,ODM',
            'remarks'              => 'nullable|string|max:1000',
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'nullable|integer|exists:products,id',
            'items.*.sku'          => 'required|string|max:100',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity'     => 'required|integer|min:1|max:999999',
            'items.*.notes'        => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'              => 'At least one order item is required.',
            'items.min'                   => 'At least one order item is required.',
            'items.*.sku.required'        => 'Each item must have a SKU.',
            'items.*.product_name.required' => 'Each item must have a product name.',
            'items.*.quantity.required'   => 'Each item must have a quantity.',
            'items.*.quantity.min'        => 'Item quantity must be at least 1.',
            'items.*.product_id.exists'   => 'The selected product does not exist.',
        ];
    }
}
