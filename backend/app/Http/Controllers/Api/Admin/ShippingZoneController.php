<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\Request;

class ShippingZoneController extends Controller
{
    public function index(Request $request)
    {
        try {
            $zones = ShippingZone::with('rates')->orderBy('name')->paginate(15);

            return $this->success([
                'data' => $zones->items(),
                'meta' => [
                    'current_page' => $zones->currentPage(),
                    'last_page' => $zones->lastPage(),
                    'total' => $zones->total(),
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
            'cities' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $zone = ShippingZone::create($validated);

        return $this->success(['data' => $zone], 'Shipping zone created successfully', 201);
    }

    public function show($id)
    {
        $zone = ShippingZone::with('rates')->findOrFail($id);
        return $this->success(['data' => $zone]);
    }

    public function update(Request $request, $id)
    {
        $zone = ShippingZone::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'cities' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $zone->update($validated);

        return $this->success(['data' => $zone->fresh()], 'Shipping zone updated successfully');
    }

    public function destroy($id)
    {
        $zone = ShippingZone::findOrFail($id);
        $zone->delete();

        return $this->success(null, 'Shipping zone deleted successfully');
    }
}
