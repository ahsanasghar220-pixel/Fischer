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
        Schema::create('visitor_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Network info
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // Geolocation
            $table->string('country', 100)->nullable();
            $table->string('country_code', 2)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Traffic source attribution
            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 200)->nullable();
            $table->text('referrer_url')->nullable();
            $table->string('referrer_domain', 255)->nullable();

            // Navigation
            $table->text('landing_page')->nullable();
            $table->text('current_page')->nullable();
            $table->integer('page_views')->default(0);

            // Device info
            $table->enum('device_type', ['desktop', 'tablet', 'mobile'])->default('desktop');
            $table->string('browser', 100)->nullable();
            $table->string('os', 100)->nullable();

            // Cart status
            $table->enum('cart_status', ['empty', 'has_items', 'checkout_started', 'converted'])->default('empty');
            $table->integer('cart_item_count')->default(0);
            $table->decimal('cart_value', 12, 2)->default(0);

            // Session timing
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_activity_at')->useCurrent();

            // Status flags
            $table->boolean('is_active')->default(true);
            $table->boolean('is_bot')->default(false);

            $table->timestamps();

            // Indexes for efficient querying
            $table->index('is_active');
            $table->index('cart_status');
            $table->index('started_at');
            $table->index('last_activity_at');
            $table->index(['country_code', 'is_active']);
            $table->index(['utm_source', 'is_active']);
            $table->index(['referrer_domain', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_sessions');
    }
};
