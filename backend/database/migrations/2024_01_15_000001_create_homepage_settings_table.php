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
        // Homepage sections configuration
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'hero', 'categories', 'featured', etc.
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('settings')->nullable(); // Section-specific settings
            $table->timestamps();
        });

        // Homepage categories (which categories to show on homepage)
        Schema::create('homepage_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        // Homepage featured products (manually selected)
        Schema::create('homepage_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('section')->default('featured'); // featured, new_arrivals, bestsellers
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        // Stats for homepage
        Schema::create('homepage_stats', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('value');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        // Features/USPs for homepage
        Schema::create('homepage_features', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        // Testimonials table (if not exists)
        if (!Schema::hasTable('testimonials')) {
            Schema::create('testimonials', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('role')->nullable();
                $table->text('content');
                $table->string('image')->nullable();
                $table->integer('rating')->default(5);
                $table->integer('sort_order')->default(0);
                $table->boolean('is_visible')->default(true);
                $table->timestamps();
            });
        }

        // Banners table enhancement (if not exists)
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->string('title')->nullable();
                $table->string('subtitle')->nullable();
                $table->string('image');
                $table->string('mobile_image')->nullable();
                $table->string('button_text')->nullable();
                $table->string('button_link')->nullable();
                $table->string('position')->default('hero'); // hero, promo, sidebar
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->timestamps();
            });
        }

        // Trust badges / brand logos
        Schema::create('homepage_trust_badges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_trust_badges');
        Schema::dropIfExists('homepage_features');
        Schema::dropIfExists('homepage_stats');
        Schema::dropIfExists('homepage_products');
        Schema::dropIfExists('homepage_categories');
        Schema::dropIfExists('homepage_sections');
        // Don't drop testimonials and banners as they might have data
    }
};
