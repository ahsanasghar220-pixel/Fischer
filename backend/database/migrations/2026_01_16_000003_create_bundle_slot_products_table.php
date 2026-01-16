<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundle_slot_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundle_slot_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_override', 12, 2)->nullable(); // Optional slot-specific pricing
            $table->timestamps();

            $table->unique(['bundle_slot_id', 'product_id']);
            $table->index('bundle_slot_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundle_slot_products');
    }
};
