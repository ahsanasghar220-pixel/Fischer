<?php

return [
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_APP_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],

    'jazzcash' => [
        'merchant_id' => env('JAZZCASH_MERCHANT_ID'),
        'password' => env('JAZZCASH_PASSWORD'),
        'integrity_salt' => env('JAZZCASH_INTEGRITY_SALT'),
        'sandbox' => env('JAZZCASH_SANDBOX', true),
        'endpoint' => env('JAZZCASH_SANDBOX', true)
            ? 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction'
            : 'https://payments.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
    ],

    'easypaisa' => [
        'store_id' => env('EASYPAISA_STORE_ID'),
        'hash_key' => env('EASYPAISA_HASH_KEY'),
        'sandbox' => env('EASYPAISA_SANDBOX', true),
    ],

    'sms' => [
        'api_key' => env('SMS_API_KEY'),
        'sender_id' => env('SMS_SENDER_ID', 'Fischer'),
    ],
];
