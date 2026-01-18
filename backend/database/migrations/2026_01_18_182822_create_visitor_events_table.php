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
        Schema::create('visitor_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Event type
            $table->enum('event_type', [
                'page_view',
                'product_view',
                'category_view',
                'add_to_cart',
                'remove_from_cart',
                'checkout_start',
                'purchase',
                'search',
                'wishlist_add',
                'bundle_view',
            ]);

            // Page context
            $table->text('page_url')->nullable();
            $table->string('page_type', 50)->nullable(); // home, product, category, checkout, etc.

            // Related entities
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bundle_id')->nullable()->constrained()->nullOnDelete();

            // Event data
            $table->json('metadata')->nullable(); // search query, filters applied, etc.
            $table->decimal('value', 12, 2)->nullable(); // transaction value or product price
            $table->integer('quantity')->nullable();

            $table->timestamp('created_at');

            // Indexes for efficient querying
            $table->index('event_type');
            $table->index('created_at');
            $table->index(['event_type', 'created_at']);
            $table->index(['visitor_session_id', 'event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_events');
    }
};
