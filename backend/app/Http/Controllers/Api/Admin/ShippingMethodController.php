<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    public function index(Request $request)
    {
        try {
            $methods = ShippingMethod::orderBy('name')->paginate(15);

            return $this->success([
                'data' => $methods->items(),
                'meta' => [
                    'current_page' => $methods->currentPage(),
                    'last_page' => $methods->lastPage(),
                    'total' => $methods->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->success(['data' => [], 'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0]]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_cost' => 'required|numeric|min:0',
            'free_shipping_threshold' => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $method = ShippingMethod::create($validated);

        return $this->success(['data' => $method], 'Shipping method created successfully', 201);
    }

    public function show($id)
    {
        $method = ShippingMethod::findOrFail($id);
        return $this->success(['data' => $method]);
    }

    public function update(Request $request, $id)
    {
        $method = ShippingMethod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'base_cost' => 'sometimes|numeric|min:0',
            'free_shipping_threshold' => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $method->update($validated);

        return $this->success(['data' => $method->fresh()], 'Shipping method updated successfully');
    }

    public function destroy($id)
    {
        $method = ShippingMethod::findOrFail($id);
        $method->delete();

        return $this->success(null, 'Shipping method deleted successfully');
    }
}
