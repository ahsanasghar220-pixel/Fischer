<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * These indexes improve query performance for common operations.
     */
    public function up(): void
    {
        // Reviews table indexes
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                // Index for filtering approved reviews by product
                if (!$this->hasIndex('reviews', 'reviews_product_id_status_index')) {
                    $table->index(['product_id', 'status'], 'reviews_product_id_status_index');
                }
                // Index for checking if user already reviewed a product
                if (!$this->hasIndex('reviews', 'reviews_user_id_product_id_index')) {
                    $table->index(['user_id', 'product_id'], 'reviews_user_id_product_id_index');
                }
            });
        }

        // Cart items table indexes
        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                // Index for product lookups in carts
                if (!$this->hasIndex('cart_items', 'cart_items_product_id_index')) {
                    $table->index('product_id', 'cart_items_product_id_index');
                }
            });
        }

        // Orders table - index for sorting by date
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                // Index for ordering by created_at (dashboard, reports)
                if (!$this->hasIndex('orders', 'orders_created_at_index')) {
                    $table->index('created_at', 'orders_created_at_index');
                }
            });
        }

        // Products table - additional indexes
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                // Index for filtering active products with category
                if (!$this->hasIndex('products', 'products_is_active_category_id_index')) {
                    $table->index(['is_active', 'category_id'], 'products_is_active_category_id_index');
                }
                // Index for featured products
                if (!$this->hasIndex('products', 'products_is_active_is_featured_index')) {
                    $table->index(['is_active', 'is_featured'], 'products_is_active_is_featured_index');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropIndex('reviews_product_id_status_index');
                $table->dropIndex('reviews_user_id_product_id_index');
            });
        }

        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropIndex('cart_items_product_id_index');
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex('orders_created_at_index');
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropIndex('products_is_active_category_id_index');
                $table->dropIndex('products_is_active_is_featured_index');
            });
        }
    }

    /**
     * Check if an index exists on a table.
     */
    protected function hasIndex(string $table, string $indexName): bool
    {
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }
        return false;
    }
};
