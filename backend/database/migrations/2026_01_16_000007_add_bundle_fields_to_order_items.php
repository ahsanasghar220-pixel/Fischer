<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('bundle_id')->nullable()->after('discount_amount')->constrained()->nullOnDelete();
            $table->string('bundle_name')->nullable()->after('bundle_id');
            $table->decimal('bundle_discount', 12, 2)->default(0)->after('bundle_name');
            $table->boolean('is_bundle_item')->default(false)->after('bundle_discount');
            $table->unsignedBigInteger('parent_order_item_id')->nullable()->after('is_bundle_item');

            $table->index('bundle_id');
            $table->index('is_bundle_item');
            $table->index('parent_order_item_id');
        });

        // Add self-referencing foreign key
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('parent_order_item_id')->references('id')->on('order_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['parent_order_item_id']);
            $table->dropForeign(['bundle_id']);
            $table->dropIndex(['bundle_id']);
            $table->dropIndex(['is_bundle_item']);
            $table->dropIndex(['parent_order_item_id']);
            $table->dropColumn(['bundle_id', 'bundle_name', 'bundle_discount', 'is_bundle_item', 'parent_order_item_id']);
        });
    }
};
