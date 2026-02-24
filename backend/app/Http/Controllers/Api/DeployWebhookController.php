<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DeployWebhookController extends Controller
{
    public function handle(Request $request)
    {
        set_time_limit(0);

        $secret   = config('deploy.webhook_secret', '');
        $provided = $request->header('X-Deploy-Secret', '');

        if (empty($secret) || !hash_equals($secret, $provided)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $output    = [];
        $startTime = time();

        try {
            $php      = $this->findPhp();
            $appPath  = base_path();
            $composer = $this->findComposer();

            // --- Composer install (only when vendor is missing or lock is newer) ---
            if (!is_dir($appPath . '/vendor') || $this->isComposerOutdated($appPath)) {
                $cmd    = "cd {$appPath} && {$php} {$composer} install --no-dev --optimize-autoloader --no-interaction 2>&1";
                $result = shell_exec($cmd) ?? '';
                $output[] = 'composer install: ' . (strlen($result) > 200 ? substr($result, -200) : trim($result));
            } else {
                $output[] = 'composer install: skipped (vendor up to date)';
            }

            // --- Clear caches before migration ---
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            $output[] = 'caches cleared';

            // --- Migrations ---
            Artisan::call('migrate', ['--force' => true]);
            $migrateOut = trim(Artisan::output());
            $output[]   = 'migrate: ' . ($migrateOut ?: 'up to date');

            // --- Safe seeders ---
            $safeSeeders = [
                'ShippingZoneSeeder',
                'ShippingMethodSeeder',
                'RolePermissionSeeder',
                'HomepageSeeder',
                'PortfolioVideoSeeder',
            ];

            foreach ($safeSeeders as $seeder) {
                try {
                    Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                    $output[] = "{$seeder}: OK";
                } catch (\Throwable $e) {
                    $output[] = "{$seeder}: skipped ({$e->getMessage()})";
                }
            }

            // --- SEED_ON_DEPLOY flag ---
            $flagFile = base_path('SEED_ON_DEPLOY');
            if (file_exists($flagFile)) {
                $extraSeeders = [
                    'CategorySeeder', 'ProductDataSeeder', 'ProductCorrectionSeeder',
                    'BannerSeeder', 'HomepageSeeder', 'SettingsSeeder', 'PageSeeder',
                ];
                foreach ($extraSeeders as $seeder) {
                    try {
                        Artisan::call('db:seed', ['--class' => $seeder, '--force' => true]);
                        $output[] = "{$seeder}: OK";
                    } catch (\Throwable $e) {
                        $output[] = "{$seeder}: FAILED ({$e->getMessage()})";
                    }
                }
                unlink($flagFile);
                $output[] = 'SEED_ON_DEPLOY: processed and removed';
            }

            // --- Rebuild caches ---
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');
            $output[] = 'caches rebuilt';

            // --- Storage symlink ---
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

            // --- Permissions ---
            shell_exec("chmod -R 755 {$appPath}/storage {$appPath}/bootstrap/cache 2>&1");
            $output[] = 'permissions: OK';

            return response()->json([
                'success'  => true,
                'duration' => (time() - $startTime) . 's',
                'output'   => $output,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success'  => false,
                'error'    => $e->getMessage(),
                'duration' => (time() - $startTime) . 's',
                'output'   => $output,
            ], 500);
        }
    }

    private function findPhp(): string
    {
        $candidates = [
            '/opt/alt/php82/usr/bin/php',
            '/usr/bin/php82',
            '/usr/bin/php8.2',
            PHP_BINARY,
        ];

        foreach ($candidates as $c) {
            if (file_exists($c) && is_executable($c)) {
                return $c;
            }
        }

        return PHP_BINARY;
    }

    private function findComposer(): string
    {
        $candidates = [
            '/usr/local/bin/composer',
            '/opt/cpanel/composer/bin/composer',
            base_path('composer.phar'),
        ];

        foreach ($candidates as $c) {
            if (file_exists($c)) {
                return $c;
            }
        }

        return 'composer';
    }

    private function isComposerOutdated(string $appPath): bool
    {
        $lock   = $appPath . '/composer.lock';
        $vendor = $appPath . '/vendor';

        if (!file_exists($lock) || !is_dir($vendor)) {
            return true;
        }

        return filemtime($lock) > filemtime($vendor);
    }
}
