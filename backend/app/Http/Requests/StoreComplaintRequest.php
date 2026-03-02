<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'complainant_type'      => 'required|in:online_customer,offline_customer,dealer',
            'complainant_name'      => 'required|string|max:255',
            'complainant_phone'     => 'required|string|max:30',
            'complainant_city'      => 'required|string|max:100',
            'complaint_category'    => 'required|in:defect,delivery,missing_item,installation,warranty,other',
            'description'           => 'required|string|max:3000',
            'customer_id'           => 'nullable|integer|exists:users,id',
            'online_order_id'       => 'nullable|integer|exists:orders,id',
            'b2b_order_id'          => 'nullable|integer|exists:b2b_orders,id',
            'dealer_purchased_from' => 'nullable|string|max:255',
            'purchase_channel'      => 'nullable|in:website,dealer,retailer,market,other',
            'approx_purchase_month' => 'nullable|integer|min:1|max:12',
            'approx_purchase_year'  => 'nullable|integer|min:1990|max:2030',
            'product_id'            => 'nullable|integer|exists:products,id',
            'sku_manual'            => 'nullable|string|max:100',
            'product_name_manual'   => 'nullable|string|max:255',
            'serial_number'         => 'nullable|string|max:100',
            'filed_by_type'         => 'nullable|in:salesperson,admin_staff,self',
        ];
    }
}
