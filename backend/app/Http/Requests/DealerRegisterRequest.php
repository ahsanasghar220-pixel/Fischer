<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DealerRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:dealers,email',
            'phone' => 'required|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'city' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'ntn_number' => 'nullable|string|max:50',
            'strn_number' => 'nullable|string|max:50',
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'business_type' => 'required|in:electronics_store,multibrand_retail,ecommerce,distributor,other',
            'current_brands' => 'nullable|string|max:1000',
            'additional_details' => 'nullable|string|max:2000',
            'documents' => 'nullable|array',
            'documents.*.type' => 'required_with:documents|in:cnic,ntn,business_registration,other',
            'documents.*.file' => 'required_with:documents|file|max:5120',
        ];
    }
}
