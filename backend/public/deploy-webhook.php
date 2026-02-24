<?php

/**
 * Standalone deploy webhook — bypasses Laravel route cache.
 *
 * Called by GitHub Actions after FTP upload. This file is served directly
 * by Apache (not through Laravel routing) so it works even when the
 * route cache is stale.
 */

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Build a proper request and handle it through the existing controller
$request = Illuminate\Http\Request::create(
    '/api/deploy-webhook',
    'POST',
    [],
    [],
    [],
    array_merge($_SERVER, [
        'HTTP_X_DEPLOY_SECRET' => $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '',
        'HTTP_CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
    ]),
    file_get_contents('php://input')
);

$app->instance('request', $request);
Illuminate\Support\Facades\Facade::clearResolvedInstance('request');

// Verify deploy secret
$secret = $app['config']->get('deploy.webhook_secret', '');
$provided = $request->header('X-Deploy-Secret', '');

if (empty($secret) || !hash_equals($secret, $provided)) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Delegate to the controller
$controller = $app->make(App\Http\Controllers\Api\DeployWebhookController::class);
$response = $controller->handle($request);

// Send response
http_response_code($response->getStatusCode());
header('Content-Type: application/json');
echo $response->getContent();
