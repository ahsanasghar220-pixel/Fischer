<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create Lahore shipping zone with free delivery
        $lahoreZoneId = DB::table('shipping_zones')->insertGetId([
            'name' => 'Lahore',
            'cities' => json_encode(['Lahore']),
            'is_active' => true,
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Remove Lahore from any existing broader zone to avoid conflicts
        $existingZones = DB::table('shipping_zones')
            ->where('id', '!=', $lahoreZoneId)
            ->get();

        foreach ($existingZones as $zone) {
            $cities = json_decode($zone->cities, true) ?? [];
            $filteredCities = array_values(array_filter($cities, fn($c) => strtolower($c) !== 'lahore'));
            if (count($filteredCities) !== count($cities)) {
                DB::table('shipping_zones')
                    ->where('id', $zone->id)
                    ->update(['cities' => json_encode($filteredCities)]);
            }
        }

        // Create a default "Rest of Pakistan" zone if it doesn't exist
        $restZoneExists = DB::table('shipping_zones')
            ->where('name', 'like', '%Rest%')
            ->orWhere('name', 'like', '%Other%')
            ->exists();

        if (!$restZoneExists) {
            $restZoneId = DB::table('shipping_zones')->insertGetId([
                'name' => 'Rest of Pakistan',
                'cities' => json_encode([]),
                'is_active' => true,
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Set up zone rates for Lahore (free delivery) if shipping methods exist
        $methods = DB::table('shipping_methods')->where('is_active', true)->get();

        foreach ($methods as $method) {
            // Lahore: free delivery
            DB::table('shipping_zone_rates')->insertOrIgnore([
                'shipping_zone_id' => $lahoreZoneId,
                'shipping_method_id' => $method->id,
                'base_cost' => 0,
                'free_shipping_threshold' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $zone = DB::table('shipping_zones')->where('name', 'Lahore')->first();
        if ($zone) {
            DB::table('shipping_zone_rates')->where('shipping_zone_id', $zone->id)->delete();
            DB::table('shipping_zones')->where('id', $zone->id)->delete();
        }
    }
};
