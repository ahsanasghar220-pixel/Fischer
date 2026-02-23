<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Deploy Webhook Secret
    |--------------------------------------------------------------------------
    |
    | This secret is used to authenticate GitHub Actions deploy webhook calls.
    | Set DEPLOY_WEBHOOK_SECRET in your server .env to a long random string,
    | then add the same value as a GitHub Actions secret named DEPLOY_WEBHOOK_SECRET.
    |
    */
    'webhook_secret' => env('DEPLOY_WEBHOOK_SECRET', ''),
];
