<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_number')->unique();
            $table->enum('complainant_type', ['online_customer', 'offline_customer', 'dealer']);
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('online_order_id')->nullable();
            $table->unsignedBigInteger('b2b_order_id')->nullable();
            $table->string('complainant_name');
            $table->string('complainant_phone');
            $table->string('complainant_city');
            $table->string('dealer_purchased_from')->nullable();
            $table->enum('purchase_channel', ['website', 'dealer', 'retailer', 'market', 'other'])->nullable();
            $table->tinyInteger('approx_purchase_month')->nullable();
            $table->smallInteger('approx_purchase_year')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('sku_manual')->nullable();
            $table->string('product_name_manual')->nullable();
            $table->string('serial_number')->nullable();
            $table->enum('complaint_category', ['defect', 'delivery', 'missing_item', 'installation', 'warranty', 'other']);
            $table->text('description');
            $table->enum('status', ['open', 'assigned', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->foreignId('filed_by_id')->constrained('users')->nullOnDelete();
            $table->enum('filed_by_type', ['salesperson', 'admin_staff', 'self']);
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('online_order_id')->references('id')->on('orders')->nullOnDelete();
            $table->foreign('b2b_order_id')->references('id')->on('b2b_orders')->nullOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
            $table->index('complainant_type');
            $table->index('filed_by_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
