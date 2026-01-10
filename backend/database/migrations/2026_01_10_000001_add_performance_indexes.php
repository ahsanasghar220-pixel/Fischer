<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing indexes for common admin queries
        Schema::table('orders', function (Blueprint $table) {
            // For admin order listing with user join
            $table->index(['created_at', 'user_id']);
        });

        // Optimize order_items for withCount queries
        if (!Schema::hasIndex('order_items', 'order_items_order_id_index')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->index('order_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'user_id']);
        });
    }
};
