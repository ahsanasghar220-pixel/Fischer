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
                    'jazzcash_merchant_id' => env('JAZZCASH_MERCHANT_ID', ''),
                    'jazzcash_password' => env('JAZZCASH_PASSWORD', ''),
                    'jazzcash_integrity_salt' => env('JAZZCASH_INTEGRITY_SALT', ''),
                    'jazzcash_return_url' => '',
                    // EasyPaisa
                    'easypaisa_enabled' => false,
                    'easypaisa_sandbox' => true,
                    'easypaisa_store_id' => env('EASYPAISA_STORE_ID', ''),
                    'easypaisa_hash_key' => env('EASYPAISA_HASH_KEY', env('EASYPAISA_PASSWORD', '')),
                    'easypaisa_return_url' => '',
                    // Credit/Debit Card via Checkout.com
                    'card_enabled' => false,
                    'checkout_sandbox' => env('CHECKOUT_SANDBOX', true),
                    'checkout_public_key' => env('CHECKOUT_PUBLIC_KEY', ''),
                    'checkout_secret_key' => env('CHECKOUT_SECRET_KEY', ''),
                    // Bank Transfer
                    'bank_transfer_enabled' => true,
                    'bank_name' => '',
                    'bank_branch' => '',
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
                'appearance' => [
                    'brand_color' => '#951212',
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
            Cache::forget('brand_color');

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

    /**
     * Public endpoint — returns the brand color (no auth required).
     * Used by the frontend on startup to apply dynamic theming.
     */
    public function brandColor()
    {
        $color = Cache::remember('brand_color', 3600, function () {
            $setting = Setting::where('key', 'appearance.brand_color')->first();
            return $setting ? $setting->value : '#951212';
        });

        return response()->json(['brand_color' => $color]);
    }

    /**
     * Public endpoint — returns enabled payment methods and bank details.
     * No auth required. Does NOT expose any API keys or secrets.
     */
    public function getPublicPaymentSettings()
    {
        $get = fn(string $key, $default = null) => Setting::get($key, $default);

        $methods = [];
        if (filter_var($get('payment.cod_enabled', true), FILTER_VALIDATE_BOOLEAN)) {
            $methods[] = ['id' => 'cod', 'name' => 'Cash on Delivery', 'description' => 'Pay cash when your order arrives', 'icon' => '💵'];
        }
        if (filter_var($get('payment.jazzcash_enabled', false), FILTER_VALIDATE_BOOLEAN)) {
            $methods[] = ['id' => 'jazzcash', 'name' => 'JazzCash', 'description' => 'Instant payment via JazzCash mobile wallet', 'icon' => '📱'];
        }
        if (filter_var($get('payment.easypaisa_enabled', false), FILTER_VALIDATE_BOOLEAN)) {
            $methods[] = ['id' => 'easypaisa', 'name' => 'EasyPaisa', 'description' => 'Instant payment via EasyPaisa mobile wallet', 'icon' => '📱'];
        }
        if (filter_var($get('payment.bank_transfer_enabled', true), FILTER_VALIDATE_BOOLEAN)) {
            $methods[] = ['id' => 'bank_transfer', 'name' => 'Bank Transfer', 'description' => 'Transfer to our bank account (Requires verification)', 'icon' => '🏦'];
        }
        if (filter_var($get('payment.card_enabled', false), FILTER_VALIDATE_BOOLEAN)) {
            $methods[] = ['id' => 'card', 'name' => 'Credit/Debit Card', 'description' => 'Pay securely with Visa or Mastercard via Safepay', 'icon' => '💳'];
        }

        $bankDetails = null;
        if (filter_var($get('payment.bank_transfer_enabled', true), FILTER_VALIDATE_BOOLEAN)) {
            $bankDetails = [
                'bank_name'      => $get('payment.bank_name', ''),
                'bank_branch'    => $get('payment.bank_branch', ''),
                'account_title'  => $get('payment.bank_account_title', ''),
                'account_number' => $get('payment.bank_account_number', ''),
                'iban'           => $get('payment.bank_iban', ''),
            ];
        }

        return response()->json([
            'data' => [
                'methods'      => $methods,
                'bank_details' => $bankDetails,
            ],
        ]);
    }
}
