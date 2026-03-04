<?php
/**
 * Standalone post-deployment task runner.
 *
 * Accessed directly as /deploy-tasks.php — bypasses Laravel routing entirely.
 * Called by GitHub Actions after FTP upload to run migrations, seeders, and cache.
 */

header('Content-Type: application/json');

// Authenticate — read secret directly from .env to bypass config cache
$provided = $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '';
$secret   = '';
$envFile  = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos($line, 'DEPLOY_WEBHOOK_SECRET=') === 0) {
            $secret = trim(substr($line, strlen('DEPLOY_WEBHOOK_SECRET=')));
            break;
        }
    }
}

if (empty($secret) || empty($provided) || !hash_equals($secret, $provided)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

set_time_limit(300);

// Bootstrap Laravel (console kernel only — no HTTP routing)
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$output    = [];
$startTime = time();

try {
    // Clear caches
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    $output[] = 'caches cleared';

    // Migrations
    try {
        Artisan::call('migrate', ['--force' => true]);
        $migrateOut = trim(Artisan::output());
        $output[]   = 'migrate: ' . ($migrateOut ?: 'up to date');
    } catch (\Throwable $e) {
        $output[] = 'migrate: FAILED (' . $e->getMessage() . ')';
    }

    // Safe seeders (idempotent — safe to run every deploy)
    $seeders = [
        'BannerSeeder',
        'HomepageSeeder',
        'ShippingZoneSeeder',
        'ShippingMethodSeeder',
        'RolePermissionSeeder',
        'PortfolioVideoSeeder',
        'PaymentSettingsSeeder',
    ];

    foreach ($seeders as $seeder) {
        try {
            Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
            $output[] = "{$seeder}: OK";
        } catch (\Throwable $e) {
            $output[] = "{$seeder}: skipped ({$e->getMessage()})";
        }
    }

    // Clear all per-key setting caches so admin-saved values are not stale
    try {
        \App\Models\Setting::clearCache();
        $output[] = 'setting caches cleared';
    } catch (\Throwable $e) {
        $output[] = 'setting caches: skipped (' . $e->getMessage() . ')';
    }

    // Rebuild caches
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    $output[] = 'caches rebuilt';

    // Storage symlink
    $link   = public_path('storage');
    $target = storage_path('app/public');
    if (!is_link($link) || realpath($link) !== realpath($target)) {
        if (is_dir($link) && !is_link($link)) {
            shell_exec('rm -rf ' . escapeshellarg($link));
        } elseif (file_exists($link) || is_link($link)) {
            unlink($link);
        }
        symlink($target, $link);
    }
    $output[] = 'storage link: OK';

    echo json_encode([
        'success'  => true,
        'duration' => (time() - $startTime) . 's',
        'output'   => $output,
    ]);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success'  => false,
        'error'    => $e->getMessage(),
        'duration' => (time() - $startTime) . 's',
        'output'   => $output,
    ]);
}
