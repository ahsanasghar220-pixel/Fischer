<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Company Information
            ['key' => 'company_name', 'value' => 'Fischer', 'group' => 'general'],
            ['key' => 'company_tagline', 'value' => 'Leading Pakistani appliances brand for water coolers, geysers, cooking ranges and chillers', 'group' => 'general'],
            ['key' => 'company_description', 'value' => 'Fischer (Fatima Engineering Works) was established in 1990 in Lahore, Pakistan. Quality-focused manufacturer approved by ISO and PSQCA with over two decades of experience.', 'group' => 'general'],
            ['key' => 'company_founded', 'value' => '1990', 'group' => 'general'],
            ['key' => 'company_mission', 'value' => 'Enhance people\'s lives by developing products and solutions for a quiet, healthy, and stylish home', 'group' => 'general'],

            // Contact Information
            ['key' => 'phone', 'value' => '+92 321 1146642', 'group' => 'contact'],
            ['key' => 'phone_landline', 'value' => '+92 (42) 35943091', 'group' => 'contact'],
            ['key' => 'email', 'value' => 'fischer.few@gmail.com', 'group' => 'contact'],
            ['key' => 'address', 'value' => 'Pindi Stop, Peco Road. Lahore, Pakistan', 'group' => 'contact'],
            ['key' => 'google_maps_url', 'value' => 'https://goo.gl/maps/srrCx9YAL6e5qpAg7', 'group' => 'contact'],
            ['key' => 'whatsapp', 'value' => '+92 321 1146642', 'group' => 'contact'],

            // Social Media
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/fischerpakistan', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/fischerpklhr/', 'group' => 'social'],

            // Certifications
            ['key' => 'certifications', 'value' => json_encode(['ISO 9001-2008', 'PSQCA Approved']), 'group' => 'general'],

            // Store Settings
            ['key' => 'currency', 'value' => 'PKR', 'group' => 'store'],
            ['key' => 'currency_symbol', 'value' => '₨', 'group' => 'store'],
            ['key' => 'store_email', 'value' => 'fischer.few@gmail.com', 'group' => 'store'],
            ['key' => 'order_prefix', 'value' => 'FSC', 'group' => 'store'],

            // SEO
            ['key' => 'meta_title', 'value' => 'Fischer Pakistan - Water Coolers, Geysers, Cooking Ranges & Appliances', 'group' => 'seo'],
            ['key' => 'meta_description', 'value' => 'Fischer is Pakistan\'s leading appliances brand manufacturing quality water coolers, geysers, cooking ranges, and kitchen appliances since 1990. ISO & PSQCA certified.', 'group' => 'seo'],
            ['key' => 'meta_keywords', 'value' => json_encode(['water cooler pakistan', 'geyser pakistan', 'cooking range', 'fischer pakistan', 'kitchen appliances lahore', 'electric water heater']), 'group' => 'seo'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
