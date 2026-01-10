<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Orders indexes for admin queries
        $this->safeAddIndex('orders', 'orders_user_id_created_at_idx', ['user_id', 'created_at']);
        $this->safeAddIndex('orders', 'orders_status_idx', ['status']);
        $this->safeAddIndex('orders', 'orders_payment_status_idx', ['payment_status']);
        $this->safeAddIndex('orders', 'orders_created_at_idx', ['created_at']);

        // Order items for counting
        $this->safeAddIndex('order_items', 'order_items_order_id_idx', ['order_id']);
        $this->safeAddIndex('order_items', 'order_items_product_id_idx', ['product_id']);

        // Products for admin listing
        $this->safeAddIndex('products', 'products_category_id_idx', ['category_id']);
        $this->safeAddIndex('products', 'products_is_active_idx', ['is_active']);
        $this->safeAddIndex('products', 'products_stock_quantity_idx', ['stock_quantity']);
        $this->safeAddIndex('products', 'products_created_at_idx', ['created_at']);

        // Product images for primary image lookup
        $this->safeAddIndex('product_images', 'product_images_product_is_primary_idx', ['product_id', 'is_primary']);

        // Users for customer queries
        $this->safeAddIndex('users', 'users_created_at_idx', ['created_at']);

        // Categories
        $this->safeAddIndex('categories', 'categories_parent_id_idx', ['parent_id']);
        $this->safeAddIndex('categories', 'categories_sort_order_idx', ['sort_order']);

        // Service requests
        $this->safeAddIndex('service_requests', 'service_requests_status_idx', ['status']);
        $this->safeAddIndex('service_requests', 'service_requests_created_at_idx', ['created_at']);

        // Dealers
        $this->safeAddIndex('dealers', 'dealers_status_idx', ['status']);
        $this->safeAddIndex('dealers', 'dealers_created_at_idx', ['created_at']);

        // Pages
        $this->safeAddIndex('pages', 'pages_slug_idx', ['slug']);
        $this->safeAddIndex('pages', 'pages_is_active_idx', ['is_active']);
    }

    public function down(): void
    {
        // Drop indexes safely
        $indexes = [
            'orders' => ['orders_user_id_created_at_idx', 'orders_status_idx', 'orders_payment_status_idx', 'orders_created_at_idx'],
            'order_items' => ['order_items_order_id_idx', 'order_items_product_id_idx'],
            'products' => ['products_category_id_idx', 'products_is_active_idx', 'products_stock_quantity_idx', 'products_created_at_idx'],
            'product_images' => ['product_images_product_is_primary_idx'],
            'users' => ['users_created_at_idx'],
            'categories' => ['categories_parent_id_idx', 'categories_sort_order_idx'],
            'service_requests' => ['service_requests_status_idx', 'service_requests_created_at_idx'],
            'dealers' => ['dealers_status_idx', 'dealers_created_at_idx'],
            'pages' => ['pages_slug_idx', 'pages_is_active_idx'],
        ];

        foreach ($indexes as $table => $indexNames) {
            foreach ($indexNames as $indexName) {
                $this->safeDropIndex($table, $indexName);
            }
        }
    }

    private function safeAddIndex(string $table, string $indexName, array $columns): void
    {
        try {
            if (!Schema::hasTable($table)) {
                return;
            }

            // Check if index exists
            $indexes = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name')->unique();
            if ($indexes->contains($indexName)) {
                return;
            }

            Schema::table($table, function (Blueprint $tbl) use ($indexName, $columns) {
                $tbl->index($columns, $indexName);
            });
        } catch (\Exception $e) {
            // Index might already exist or table doesn't have the column
        }
    }

    private function safeDropIndex(string $table, string $indexName): void
    {
        try {
            if (!Schema::hasTable($table)) {
                return;
            }

            $indexes = collect(DB::select("SHOW INDEX FROM `{$table}`"))->pluck('Key_name')->unique();
            if (!$indexes->contains($indexName)) {
                return;
            }

            Schema::table($table, function (Blueprint $tbl) use ($indexName) {
                $tbl->dropIndex($indexName);
            });
        } catch (\Exception $e) {
            // Index might not exist
        }
    }
};
