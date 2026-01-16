<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->text('description')->nullable();
            $table->string('short_description')->nullable();

            // Pricing
            $table->enum('discount_type', ['fixed_price', 'percentage'])->default('percentage');
            $table->decimal('discount_value', 12, 2)->default(0); // Fixed price OR percentage

            // Display
            $table->string('badge_label', 50)->nullable(); // e.g., "Best Value", "Limited Time"
            $table->string('badge_color', 20)->default('gold'); // e.g., "red", "gold", "blue"
            $table->string('theme_color', 20)->nullable(); // For card styling

            // Media
            $table->string('featured_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->string('video_url')->nullable();

            // Availability
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->integer('stock_limit')->nullable(); // NULL = unlimited
            $table->integer('stock_sold')->default(0);

            // Configuration
            $table->enum('bundle_type', ['fixed', 'configurable'])->default('fixed');
            $table->enum('cart_display', ['single_item', 'grouped', 'individual'])->default('grouped');
            $table->boolean('allow_coupon_stacking')->default(false);

            // Display placement
            $table->boolean('show_on_homepage')->default(false);
            $table->enum('homepage_position', ['carousel', 'grid', 'banner'])->nullable();
            $table->integer('display_order')->default(0);

            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();

            // Marketing
            $table->string('cta_text', 100)->default('Add Bundle to Cart');
            $table->boolean('show_countdown')->default(false);
            $table->boolean('show_savings')->default(true);

            // Analytics tracking
            $table->integer('view_count')->default(0);
            $table->integer('add_to_cart_count')->default(0);
            $table->integer('purchase_count')->default(0);
            $table->decimal('revenue', 12, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('is_active');
            $table->index('show_on_homepage');
            $table->index('homepage_position');
            $table->index(['starts_at', 'ends_at']);
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundles');
    }
};
