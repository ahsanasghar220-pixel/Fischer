<?php

/**
 * Standalone deploy webhook — bypasses Laravel's route cache entirely.
 *
 * The .htaccess rewrites /deploy-run → deploy-run.php (direct PHP file).
 * This avoids the chicken-and-egg problem: route cache can't be cleared
 * via the webhook if the webhook itself depends on route matching.
 *
 * Called via GET by GitHub Actions after FTP upload.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Bootstrap via console kernel — loads config, DB, services
// without going through HTTP routing/middleware.
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

header('Content-Type: application/json');

// Verify deploy secret
$secret   = config('deploy.webhook_secret', '');
$headers  = function_exists('getallheaders') ? getallheaders() : [];
$provided = $headers['X-Deploy-Secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');

if (empty($secret) || !hash_equals($secret, $provided)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Build a request object and delegate to the controller
$request = Illuminate\Http\Request::create(
    '/deploy-run',
    'GET',
    [],
    [],
    [],
    ['HTTP_X_DEPLOY_SECRET' => $provided, 'HTTP_ACCEPT' => 'application/json']
);

$controller = $app->make(\App\Http\Controllers\Api\DeployWebhookController::class);
$response   = $controller->handle($request);

http_response_code($response->getStatusCode());
echo $response->getContent();
