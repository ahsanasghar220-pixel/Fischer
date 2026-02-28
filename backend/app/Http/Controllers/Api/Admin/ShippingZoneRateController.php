<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use App\Models\ShippingZoneRate;
use Illuminate\Http\Request;

class ShippingZoneRateController extends Controller
{
    /**
     * Sync rate overrides for a given zone.
     * Accepts an array of { shipping_method_id, rate } and upserts them.
     */
    public function sync(Request $request, ShippingZone $zone)
    {
        $validated = $request->validate([
            'rates'                          => 'required|array',
            'rates.*.shipping_method_id'     => 'required|exists:shipping_methods,id',
            'rates.*.rate'                   => 'required|numeric|min:0',
        ]);

        foreach ($validated['rates'] as $rateData) {
            ShippingZoneRate::updateOrCreate(
                [
                    'shipping_zone_id'   => $zone->id,
                    'shipping_method_id' => $rateData['shipping_method_id'],
                ],
                [
                    'rate' => $rateData['rate'],
                ]
            );
        }

        return $this->success(
            ['data' => $zone->fresh()->load('rates')],
            'Zone rates updated successfully'
        );
    }
}
