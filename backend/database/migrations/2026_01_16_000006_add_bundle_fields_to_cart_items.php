<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreignId('bundle_id')->nullable()->after('product_variant_id')->constrained()->nullOnDelete();
            $table->json('bundle_slot_selections')->nullable()->after('bundle_id'); // For configurable bundles: [{slot_id, product_id}, ...]
            $table->boolean('is_bundle_item')->default(false)->after('bundle_slot_selections');
            $table->unsignedBigInteger('parent_cart_item_id')->nullable()->after('is_bundle_item'); // Links individual items to bundle parent

            $table->index('bundle_id');
            $table->index('is_bundle_item');
            $table->index('parent_cart_item_id');
        });

        // Add self-referencing foreign key
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreign('parent_cart_item_id')->references('id')->on('cart_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['parent_cart_item_id']);
            $table->dropForeign(['bundle_id']);
            $table->dropIndex(['bundle_id']);
            $table->dropIndex(['is_bundle_item']);
            $table->dropIndex(['parent_cart_item_id']);
            $table->dropColumn(['bundle_id', 'bundle_slot_selections', 'is_bundle_item', 'parent_cart_item_id']);
        });
    }
};
