<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
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
            // Try to get settings from database
            $dbSettings = Setting::pluck('value', 'key')->toArray();

            // Default settings structure
            $defaults = [
                'general' => [
                    'site_name' => 'Fischer Pakistan',
                    'site_tagline' => 'Quality Home Appliances',
                    'contact_email' => 'info@fischerpk.com',
                    'contact_phone' => '+92 300 1234567',
                    'whatsapp_number' => '+92 300 1234567',
                    'address' => '123 Industrial Area, Lahore, Pakistan',
                    'logo_url' => '',
                    'favicon_url' => '',
                    'footer_text' => '',
                ],
                'payment' => [
                    // Cash on Delivery
                    'cod_enabled' => true,
                    'cod_extra_charges' => 0,
                    // JazzCash
                    'jazzcash_enabled' => false,
                    'jazzcash_sandbox' => true,
                    'jazzcash_merchant_id' => '',
                    'jazzcash_password' => '',
                    'jazzcash_integrity_salt' => '',
                    'jazzcash_return_url' => '',
                    // EasyPaisa
                    'easypaisa_enabled' => false,
                    'easypaisa_sandbox' => true,
                    'easypaisa_store_id' => '',
                    'easypaisa_hash_key' => '',
                    'easypaisa_return_url' => '',
                    // Stripe/Card payments
                    'card_enabled' => false,
                    'stripe_sandbox' => true,
                    'stripe_publishable_key' => '',
                    'stripe_secret_key' => '',
                    'stripe_webhook_secret' => '',
                    // Bank Transfer
                    'bank_transfer_enabled' => true,
                    'bank_name' => '',
                    'bank_account_title' => '',
                    'bank_account_number' => '',
                    'bank_iban' => '',
                ],
                'shipping' => [
                    'free_shipping_threshold' => 10000,
                    'default_shipping_cost' => 250,
                    'express_shipping_cost' => 500,
                    'same_day_cost' => 1000,
                    'delivery_time_standard' => '3-5 business days',
                    'delivery_time_express' => '1-2 business days',
                    'delivery_time_same_day' => 'Same day delivery',
                ],
                'email' => [
                    'smtp_host' => '',
                    'smtp_port' => '587',
                    'smtp_username' => '',
                    'smtp_password' => '',
                    'smtp_encryption' => 'tls',
                    'from_email' => '',
                    'from_name' => 'Fischer Pakistan',
                    'order_confirmation_enabled' => true,
                    'shipping_notification_enabled' => true,
                    'welcome_email_enabled' => true,
                ],
                'seo' => [
                    'meta_title' => 'Fischer Pakistan - Quality Home Appliances',
                    'meta_description' => 'Shop premium quality water heaters, geysers, and home appliances from Fischer Pakistan.',
                    'meta_keywords' => 'fischer, water heater, geyser, pakistan, home appliances',
                    'google_analytics_id' => '',
                    'facebook_pixel_id' => '',
                    'og_image' => '',
                    'sitemap_enabled' => true,
                ],
                'notifications' => [
                    'order_notification_emails' => 'fischer.few@gmail.com',
                    'order_notification_enabled' => true,
                    'order_confirmation_to_customer' => true,
                ],
                'social' => [
                    'facebook_url' => '',
                    'instagram_url' => '',
                    'youtube_url' => '',
                    'twitter_url' => '',
                    'linkedin_url' => '',
                    'tiktok_url' => '',
                ],
                'loyalty' => [
                    'enabled' => true,
                    'points_per_amount' => 100,
                    'point_value' => 1,
                    'review_bonus' => 10,
                    'referral_bonus' => 50,
                    'birthday_bonus' => 100,
                    'min_redeem_points' => 0,
                ],
            ];

            // Merge database settings with defaults
            foreach ($dbSettings as $key => $value) {
                $parts = explode('.', $key);
                if (count($parts) === 2) {
                    $group = $parts[0];
                    $setting = $parts[1];
                    if (isset($defaults[$group])) {
                        $decodedValue = json_decode($value, true);
                        $defaults[$group][$setting] = $decodedValue !== null ? $decodedValue : $value;
                    }
                }
            }

            return $defaults;
        });

        return $this->success($settings);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        try {
            $data = $request->all();

            foreach ($data as $group => $settings) {
                if (is_array($settings)) {
                    foreach ($settings as $key => $value) {
                        $settingKey = "{$group}.{$key}";
                        $settingValue = is_array($value) || is_bool($value) ? json_encode($value) : $value;

                        Setting::updateOrCreate(
                            ['key' => $settingKey],
                            ['value' => $settingValue, 'group' => $group]
                        );
                    }
                }
            }

            // Clear cache
            Cache::forget('app_settings');

            return $this->success(null, 'Settings updated successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to update settings: ' . $e->getMessage(), 500);
        }
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
