<?php

/**
 * Standalone deploy webhook — bypasses Laravel's HTTP routing entirely.
 *
 * The .htaccess serves this file directly (it exists on disk, so the
 * RewriteCond %{REQUEST_FILENAME} -f rule applies and stops the rewrite).
 * No route cache, no CSRF, no middleware stack involved.
 *
 * Called via GET by GitHub Actions after FTP upload.
 * Updated: 2026-02-24.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Bootstrap via console kernel — this properly boots the app (config, DB, etc.)
// without going through the HTTP routing/middleware stack.
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

header('Content-Type: application/json');

// Verify secret (config() is now available after bootstrap)
$secret   = config('deploy.webhook_secret', '');
$headers  = function_exists('getallheaders') ? getallheaders() : [];
$provided = $headers['X-Deploy-Secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');

if (empty($secret) || !hash_equals($secret, $provided)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Build a synthetic POST request so the controller's own auth check passes
$request = Illuminate\Http\Request::create(
    '/api/deploy-webhook',
    'POST',
    [],
    [],
    [],
    ['HTTP_X_DEPLOY_SECRET' => $provided, 'HTTP_ACCEPT' => 'application/json']
);

// Delegate to the controller (handles migrations, seeders, cache rebuild, etc.)
$controller = app(\App\Http\Controllers\Api\DeployWebhookController::class);
$response   = $controller->handle($request);

http_response_code($response->getStatusCode());
echo $response->getContent();
