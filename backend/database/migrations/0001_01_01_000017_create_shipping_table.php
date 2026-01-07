<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Shipping zones
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('cities'); // List of cities in this zone
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Shipping methods
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('calculation_type', ['flat', 'weight', 'price', 'item'])->default('flat');
            $table->decimal('base_cost', 10, 2)->default(0);
            $table->decimal('per_kg_cost', 10, 2)->default(0);
            $table->decimal('per_item_cost', 10, 2)->default(0);
            $table->decimal('free_shipping_threshold', 12, 2)->nullable();
            $table->integer('min_delivery_days')->default(1);
            $table->integer('max_delivery_days')->default(5);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Zone-specific rates
        Schema::create('shipping_zone_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipping_method_id')->constrained()->cascadeOnDelete();
            $table->decimal('rate', 10, 2);
            $table->decimal('per_kg_rate', 10, 2)->nullable();
            $table->decimal('free_shipping_threshold', 12, 2)->nullable();
            $table->integer('min_delivery_days')->nullable();
            $table->integer('max_delivery_days')->nullable();
            $table->timestamps();

            $table->unique(['shipping_zone_id', 'shipping_method_id'], 'zone_method_unique');
        });

        // Courier integrations
        Schema::create('courier_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('logo')->nullable();
            $table->string('api_endpoint')->nullable();
            $table->json('credentials')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_services');
        Schema::dropIfExists('shipping_zone_rates');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('shipping_zones');
    }
};
