<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Products table - Add index on slug and is_active for faster lookups
        Schema::table('products', function (Blueprint $table) {
            $table->index(['slug', 'is_active'], 'products_slug_is_active_index');
        });

        // Orders table - Add index on order_number and deleted_at for tracking queries
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['order_number', 'deleted_at'], 'orders_order_number_deleted_at_index');
        });

        // Carts table - Add indexes on user_id and session_id for cart lookups
        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id', 'carts_user_id_index');
            $table->index('session_id', 'carts_session_id_index');
        });

        // Wishlist table - Add composite index for user-product lookups
        Schema::table('wishlist', function (Blueprint $table) {
            $table->index(['user_id', 'product_id'], 'wishlist_user_product_index');
        });

        // Shipping zones table - Add index on city for checkout queries
        Schema::table('shipping_zones', function (Blueprint $table) {
            $table->index('city', 'shipping_zones_city_index');
        });

        // Visitor sessions table - Add index on session_id for analytics
        Schema::table('visitor_sessions', function (Blueprint $table) {
            $table->index('session_id', 'visitor_sessions_session_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_slug_is_active_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_order_number_deleted_at_index');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('carts_user_id_index');
            $table->dropIndex('carts_session_id_index');
        });

        Schema::table('wishlist', function (Blueprint $table) {
            $table->dropIndex('wishlist_user_product_index');
        });

        Schema::table('shipping_zones', function (Blueprint $table) {
            $table->dropIndex('shipping_zones_city_index');
        });

        Schema::table('visitor_sessions', function (Blueprint $table) {
            $table->dropIndex('visitor_sessions_session_id_index');
        });
    }
};
