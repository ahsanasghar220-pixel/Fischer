<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class PaymentSettingsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Step 1: Migrate orphaned bank.* keys → payment.* ──────────────────
        // Before commit e17c047 the SettingController stored bank fields under
        // bank.* prefix.  The controller was fixed to use payment.* but any
        // previously saved values remain under the old keys and are invisible.
        $migrations = [
            'bank.bank_name'           => 'payment.bank_name',
            'bank.bank_branch'         => 'payment.bank_branch',
            'bank.bank_account_title'  => 'payment.bank_account_title',
            'bank.bank_account_number' => 'payment.bank_account_number',
            'bank.bank_iban'           => 'payment.bank_iban',
            'bank.bank_transfer_enabled' => 'payment.bank_transfer_enabled',
        ];

        foreach ($migrations as $oldKey => $newKey) {
            $old = Setting::where('key', $oldKey)->first();
            if ($old) {
                // Only copy if new key doesn't already exist
                if (!Setting::where('key', $newKey)->exists()) {
                    Setting::create([
                        'key'   => $newKey,
                        'value' => $old->value,
                        'group' => 'payment',
                    ]);
                }
                $old->delete();
            }
        }

        // ── Step 2: Seed defaults with firstOrCreate ───────────────────────────
        // firstOrCreate means: insert only if the key is absent — never
        // overwrites values the admin has already set through the UI.
        $defaults = [
            // Bank Transfer — Meezan Bank (Fatima Engineering Works)
            ['key' => 'payment.bank_transfer_enabled', 'value' => 'true',                                   'group' => 'payment'],
            ['key' => 'payment.bank_name',             'value' => 'Meezan Bank',                            'group' => 'payment'],
            ['key' => 'payment.bank_branch',           'value' => '(0292) Haider Road Township Branch, Lahore', 'group' => 'payment'],
            ['key' => 'payment.bank_account_title',    'value' => 'Fatima Engineering Works',               'group' => 'payment'],
            ['key' => 'payment.bank_account_number',   'value' => '0292-0103728472',                        'group' => 'payment'],
            ['key' => 'payment.bank_iban',             'value' => 'PK22MEZN0002920103728472',               'group' => 'payment'],

            // Cash on Delivery — enabled by default
            ['key' => 'payment.cod_enabled',       'value' => 'true', 'group' => 'payment'],
            ['key' => 'payment.cod_extra_charges',  'value' => '0',    'group' => 'payment'],

            // Digital wallets — disabled until credentials are configured
            ['key' => 'payment.jazzcash_enabled',  'value' => 'false', 'group' => 'payment'],
            ['key' => 'payment.jazzcash_sandbox',   'value' => 'true',  'group' => 'payment'],
            ['key' => 'payment.easypaisa_enabled', 'value' => 'false', 'group' => 'payment'],
            ['key' => 'payment.easypaisa_sandbox',  'value' => 'true',  'group' => 'payment'],

            // Card (Paymob Pakistan) — keys are entered via Admin → Settings → Payment
            ['key' => 'payment.card_enabled',            'value' => 'false', 'group' => 'payment'],
            ['key' => 'payment.paymob_sandbox',          'value' => 'true',  'group' => 'payment'],
            ['key' => 'payment.paymob_api_key',          'value' => '',      'group' => 'payment'],
            ['key' => 'payment.paymob_integration_id',   'value' => '',      'group' => 'payment'],
            ['key' => 'payment.paymob_iframe_id',        'value' => '',      'group' => 'payment'],
            ['key' => 'payment.paymob_hmac_secret',      'value' => '',      'group' => 'payment'],
        ];

        foreach ($defaults as $item) {
            Setting::firstOrCreate(['key' => $item['key']], $item);
        }

        // Clear the settings cache so changes are visible immediately
        Cache::forget('app_settings');
    }
}
