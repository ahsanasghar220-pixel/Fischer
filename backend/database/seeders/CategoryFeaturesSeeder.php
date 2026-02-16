<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoryFeaturesSeeder extends Seeder
{
    public function run(): void
    {
        $categoryFeatures = [
            'kitchen-hoods' => [
                'Premium Quality',
                'BLDC copper motor',
                '1 Year Warranty',
                'Energy Efficient',
                'Heat + Auto clean',
                'Gesture and Touch Control',
                'Inverter Technology A+++ rated',
                'Low noise level',
            ],
            'hobs-hoods' => [
                'Complete Brass Burners',
                'Sabaf Burners',
                'EPS Burners',
                'Tempered Glass',
                'Flame Failure Device',
                'Stainless steel finish',
                '5KW powerful burners',
                'Immediate Auto Ignition',
            ],
            'built-in-hobs' => [
                'Complete Brass Burners',
                'Sabaf Burners',
                'EPS Burners',
                'Tempered Glass',
                'Flame Failure Device',
                'Stainless steel finish',
                '5KW powerful burners',
                'Immediate Auto Ignition',
            ],
            'geysers-heaters' => [
                'Overheating Protection',
                'Wattage Control',
                'Fully Insulated',
                'Accurate Volume Capacity',
                'Incoloy 840 heating element',
                'Imported Brass safety Valves',
            ],
            'hybrid-geysers' => [
                'Overheating Protection',
                'Wattage Control',
                'Fully Insulated',
                'Accurate Volume Capacity',
                'Incoloy 840 heating element',
                'Imported Brass safety Valves',
            ],
            'gas-water-heaters' => [
                'Overheating Protection',
                'Wattage Control',
                'Fully Insulated',
                'Accurate Volume Capacity',
                'Incoloy 840 heating element',
                'Imported Brass safety Valves',
            ],
            'instant-electric-water-heaters' => [
                'Overheating Protection',
                'Wattage Control',
                'Fully Insulated',
                'Accurate Volume Capacity',
                'Incoloy 840 heating element',
                'Imported Brass safety Valves',
            ],
            'fast-electric-water-heaters' => [
                'Overheating Protection',
                'Wattage Control',
                'Fully Insulated',
                'Accurate Volume Capacity',
                'Incoloy 840 heating element',
                'Imported Brass safety Valves',
            ],
            'oven-toasters' => [
                'Double Layered Glass door',
                'Inner lamp',
                'Rotisserie Function',
                'Convection Function',
                'Stainless steel elements',
            ],
            'water-dispensers' => [
                'Food-grade stainless steel tanks',
                'Eco-friendly refrigerants',
                '100% copper coiling',
            ],
            'air-fryers' => [
                'Digital Touch panel',
                'Wide Temperature Control',
                'Injection molding texture',
                'Non-stick coating',
                'Bottom heater for Even temperature control',
            ],
            'water-coolers' => [
                'Adjustable Thermostat',
                'Food Grade Non Magnetic stainless steel',
                'High back pressure compressor',
                'Spring loaded push button',
            ],
            'storage-coolers' => [
                'Adjustable Thermostat',
                'Food Grade Non Magnetic stainless steel',
                'High back pressure compressor',
                'Spring loaded push button',
            ],
            'cooking-ranges' => [
                'Complete Brass Burners',
                'Tempered Glass',
                'Flame Failure Device',
                'Stainless steel finish',
                '5KW powerful burners',
                'Auto Ignition',
            ],
            'blenders-processors' => [
                'Multi-Function Food processing',
                'Precision stainless steel blades & Discs',
                'Pulse & Speed control',
                'Generous Capacity',
            ],
            'room-coolers' => [
                'High Air Delivery',
                'Large Water Tank',
                'Honeycomb Cooling Pads',
                'Inverter Compatible',
                'Low Power Consumption',
            ],
        ];

        foreach ($categoryFeatures as $slug => $features) {
            Category::where('slug', $slug)
                ->whereNull('features')
                ->update(['features' => json_encode($features)]);
        }
    }
}
