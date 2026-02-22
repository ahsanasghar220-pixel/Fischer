<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'city' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'product_id' => 'nullable|exists:products,id',
            'product_name' => 'required|string|max:255',
            'model_number' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date|before_or_equal:today',
            'under_warranty' => 'boolean',
            'service_type' => 'required|in:installation,repair,maintenance,warranty_claim,replacement,other',
            'problem_description' => 'required|string|min:20|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:5120',
        ];
    }
}
