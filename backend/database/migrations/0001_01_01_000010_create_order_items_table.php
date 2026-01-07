<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();

            // Snapshot of product at time of order
            $table->string('product_name');
            $table->string('product_sku');
            $table->string('product_image')->nullable();
            $table->json('variant_attributes')->nullable(); // {size: "15L", color: "White"}

            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);

            // For returns
            $table->integer('quantity_returned')->default(0);
            $table->decimal('refund_amount', 12, 2)->default(0);

            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
