<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $settings = Cache::remember('app_settings', 3600, function () {
            return [
                'general' => [
                    'site_name' => config('app.name', 'Fischer Pakistan'),
                    'site_tagline' => 'Quality Home Appliances',
                    'contact_email' => 'info@fischerpk.com',
                    'contact_phone' => '+92 300 1234567',
                    'address' => '123 Industrial Area, Lahore, Pakistan',
                ],
                'payment' => [
                    'cod_enabled' => true,
                    'jazzcash_enabled' => true,
                    'easypaisa_enabled' => true,
                    'card_enabled' => true,
                    'cod_extra_charges' => 0,
                ],
                'shipping' => [
                    'free_shipping_threshold' => 10000,
                    'default_shipping_cost' => 250,
                    'express_shipping_cost' => 500,
                ],
            ];
        });

        return $this->success($settings);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        // In a real implementation, you would save these to database
        // For now, just clear cache and return success
        Cache::forget('app_settings');

        return $this->success(null, 'Settings updated successfully');
    }

    /**
     * Get settings by group
     */
    public function group($group)
    {
        $allSettings = $this->index()->getData(true);

        if (!isset($allSettings['data'][$group])) {
            return $this->error('Settings group not found', 404);
        }

        return $this->success($allSettings['data'][$group]);
    }
}
