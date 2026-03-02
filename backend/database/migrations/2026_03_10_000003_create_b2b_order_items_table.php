<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('b2b_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('b2b_order_id')->constrained('b2b_orders')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('sku');
            $table->string('product_name');
            $table->integer('quantity')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->index('b2b_order_id');
            $table->index('sku');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2b_order_items');
    }
};
