<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Shipping info (accept either name or first_name/last_name)
            'shipping_name' => 'required_without_all:shipping_first_name,shipping_last_name|nullable|string|max:255',
            'shipping_first_name' => 'required_without:shipping_name|nullable|string|max:255',
            'shipping_last_name' => 'required_without:shipping_name|nullable|string|max:255',
            'shipping_phone' => 'required|string|max:20',
            'shipping_email' => 'nullable|email|max:255',
            'shipping_address_line_1' => 'required|string|max:500',
            'shipping_address_line_2' => 'nullable|string|max:500',
            'shipping_city' => 'required|string|max:255',
            'shipping_state' => 'nullable|string|max:255',
            'shipping_postal_code' => 'nullable|string|max:10',

            // Billing (optional)
            'billing_same_as_shipping' => 'boolean',
            'billing_name' => 'nullable|string|max:255',
            'billing_first_name' => 'nullable|string|max:255',
            'billing_last_name' => 'nullable|string|max:255',
            'billing_phone' => 'nullable|string|max:20',
            'billing_address_line_1' => 'nullable|string|max:500',
            'billing_city' => 'nullable|string|max:255',

            // Payment
            'payment_method' => 'required|in:cod,bank_transfer,jazzcash,easypaisa,card',
            'transaction_id' => 'required_if:payment_method,bank_transfer|nullable|string|max:255',
            'payment_proof' => 'nullable|string', // Base64 image or URL

            // Shipping method
            'shipping_method_id' => 'required|exists:shipping_methods,id',

            // Loyalty points
            'loyalty_points' => 'nullable|integer|min:0',

            // Notes
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
