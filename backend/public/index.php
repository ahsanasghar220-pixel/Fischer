<?php

use Illuminate\Http\Request;

// Production settings - errors logged to file, not displayed
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

/*
|--------------------------------------------------------------------------
| Deploy Webhook Handler (bypasses Laravel routing entirely)
|--------------------------------------------------------------------------
|
| Intercepts GET /deploy-run BEFORE Laravel boots its HTTP router.
| This avoids the route-cache chicken-and-egg problem: we can't clear
| the route cache via a webhook if the webhook depends on route matching.
|
| Bootstraps Laravel via the console kernel (config, DB, services only),
| then delegates to DeployWebhookController.
|
*/
$uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
if ($uri === '/deploy-run') {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    header('Content-Type: application/json');

    $secret   = config('deploy.webhook_secret', '');
    $headers  = function_exists('getallheaders') ? getallheaders() : [];
    $provided = $headers['X-Deploy-Secret'] ?? ($_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');

    if (empty($secret) || !hash_equals($secret, $provided)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $request    = \Illuminate\Http\Request::create('/deploy-run', 'GET', [], [], [],
                    ['HTTP_X_DEPLOY_SECRET' => $provided, 'HTTP_ACCEPT' => 'application/json']);
    $controller = $app->make(\App\Http\Controllers\Api\DeployWebhookController::class);
    $response   = $controller->handle($request);

    http_response_code($response->getStatusCode());
    echo $response->getContent();
    exit;
}

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Check if vendor/autoload.php exists
if (!file_exists(__DIR__.'/../vendor/autoload.php')) {
    die('Vendor autoload not found. Please run: composer install');
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
