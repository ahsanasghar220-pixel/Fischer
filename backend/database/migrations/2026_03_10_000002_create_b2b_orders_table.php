<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('b2b_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('salesperson_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('dealer_name');
            $table->string('city');
            $table->enum('brand_name', ['Fischer', 'OEM', 'ODM'])->default('Fischer');
            $table->enum('status', ['pending', 'in_production', 'ready', 'delivered', 'cancelled'])->default('pending');
            $table->date('delivery_estimate')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2b_orders');
    }
};
