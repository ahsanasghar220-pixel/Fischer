<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default_shipping')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($addresses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'is_default_shipping' => 'boolean',
            'is_default_billing' => 'boolean',
        ]);

        $user = $request->user();

        // If this is the first address, make it default
        $isFirst = !$user->addresses()->exists();

        $address = $user->addresses()->create([
            ...$validated,
            'country' => 'Pakistan',
            'is_default_shipping' => $validated['is_default_shipping'] ?? $isFirst,
            'is_default_billing' => $validated['is_default_billing'] ?? $isFirst,
        ]);

        // Update other addresses if this is set as default
        if ($address->is_default_shipping) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default_shipping' => false]);
        }
        if ($address->is_default_billing) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default_billing' => false]);
        }

        return $this->success($address, 'Address added successfully', 201);
    }

    public function update(Request $request, Address $address)
    {
        // Ensure the address belongs to the user
        if ($address->user_id !== $request->user()->id) {
            return $this->error('Address not found', 404);
        }

        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address_line_1' => 'sometimes|required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
        ]);

        $address->update($validated);

        return $this->success($address->fresh(), 'Address updated successfully');
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->error('Address not found', 404);
        }

        $address->delete();

        return $this->success(null, 'Address deleted successfully');
    }

    public function setDefaultShipping(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->error('Address not found', 404);
        }

        $address->setAsDefaultShipping();

        return $this->success($address->fresh(), 'Default shipping address updated');
    }

    public function setDefaultBilling(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->error('Address not found', 404);
        }

        $address->setAsDefaultBilling();

        return $this->success($address->fresh(), 'Default billing address updated');
    }
}
