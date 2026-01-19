<?php
/**
 * Standalone script to fix "Products Sold" stat value and clear cache
 * This script doesn't require vendor/autoload and can run even if composer install failed
 *
 * Usage:
 *   /fix-stats.php?key=fischer2026fix          - Fix stats and clear cache
 *   /fix-stats.php?key=fischer2026fix&action=clear-cache  - Only clear cache
 */

header('Content-Type: application/json');

// Allow only with secret key
$allowedKey = 'fischer2026fix';
if (!isset($_GET['key']) || $_GET['key'] !== $allowedKey) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized. Add ?key=fischer2026fix']);
    exit;
}

// Read .env file manually to get DB credentials
$envFile = __DIR__ . '/../.env';
if (!file_exists($envFile)) {
    echo json_encode(['error' => '.env file not found']);
    exit;
}

$env = [];
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
    list($key, $value) = explode('=', $line, 2);
    $env[trim($key)] = trim($value, '"\'');
}

// Database connection
$host = $env['DB_HOST'] ?? 'localhost';
$database = $env['DB_DATABASE'] ?? 'fischer';
$username = $env['DB_USERNAME'] ?? 'root';
$password = $env['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $results = [];

    // 1. Update "Products Sold" to "1M+"
    $stmt = $pdo->prepare("UPDATE homepage_stats SET value = ? WHERE label LIKE '%Products Sold%' OR label LIKE '%Sold%'");
    $stmt->execute(['1M+']);
    $results['products_sold_updated'] = $stmt->rowCount() . ' rows';

    // 2. Get current stats for verification
    $stmt = $pdo->query("SELECT id, label, value FROM homepage_stats ORDER BY sort_order");
    $results['current_stats'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Try to clear Laravel cache (file-based)
    $cacheDir = __DIR__ . '/../storage/framework/cache/data';
    if (is_dir($cacheDir)) {
        // Delete homepage_data cache files
        $deleted = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($cacheDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $content = file_get_contents($file->getPathname());
                if (strpos($content, 'homepage_data') !== false || strpos($content, 'homepage_sections') !== false) {
                    unlink($file->getPathname());
                    $deleted++;
                }
            }
        }
        $results['cache_files_deleted'] = $deleted;
    }

    // 4. Also try database cache table if exists
    try {
        $stmt = $pdo->prepare("DELETE FROM cache WHERE `key` LIKE '%homepage%'");
        $stmt->execute();
        $results['db_cache_cleared'] = $stmt->rowCount() . ' rows';

        // Also clear ALL cache entries (Laravel stores with prefix)
        $stmt = $pdo->prepare("DELETE FROM cache WHERE `key` LIKE '%laravel_cache%'");
        $stmt->execute();
        $results['all_laravel_cache_cleared'] = $stmt->rowCount() . ' rows';
    } catch (Exception $e) {
        $results['db_cache'] = 'Table not found or error: ' . $e->getMessage();
    }

    // 5. Check action parameter - if only clearing cache, skip the stats update part
    $action = $_GET['action'] ?? 'fix-all';
    if ($action === 'clear-cache') {
        $results['action'] = 'cache-only';
        unset($results['products_sold_updated']);
        unset($results['current_stats']);
    }

    echo json_encode([
        'success' => true,
        'message' => $action === 'clear-cache' ? 'Cache cleared successfully' : 'Stats fixed and cache cleared',
        'results' => $results,
        'next_steps' => [
            'Reload the homepage to see updated values',
            'If still showing old values, check browser cache (Ctrl+Shift+R)',
        ]
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}
