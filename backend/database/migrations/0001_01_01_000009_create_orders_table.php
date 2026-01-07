<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dealer_id')->nullable()->constrained('dealers')->nullOnDelete();

            // Guest checkout info
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned',
                'refunded'
            ])->default('pending');

            // Payment
            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'refunded',
                'partially_refunded'
            ])->default('pending');
            $table->enum('payment_method', [
                'cod',
                'bank_transfer',
                'jazzcash',
                'easypaisa',
                'card'
            ])->default('cod');
            $table->string('transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Amounts
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            // Shipping address
            $table->string('shipping_first_name');
            $table->string('shipping_last_name');
            $table->string('shipping_phone');
            $table->string('shipping_email')->nullable();
            $table->string('shipping_address_line_1');
            $table->string('shipping_address_line_2')->nullable();
            $table->string('shipping_city');
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->default('Pakistan');

            // Billing address (if different)
            $table->boolean('same_billing_address')->default(true);
            $table->string('billing_first_name')->nullable();
            $table->string('billing_last_name')->nullable();
            $table->string('billing_phone')->nullable();
            $table->string('billing_address_line_1')->nullable();
            $table->string('billing_address_line_2')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_postal_code')->nullable();
            $table->string('billing_country')->nullable();

            // Shipping details
            $table->string('shipping_method')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('courier_name')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            // Coupon
            $table->string('coupon_code')->nullable();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();

            // Loyalty
            $table->integer('loyalty_points_earned')->default(0);
            $table->integer('loyalty_points_used')->default(0);
            $table->decimal('loyalty_discount', 12, 2)->default(0);

            // Notes
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();

            // Source
            $table->string('source')->default('website'); // website, admin, dealer
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index('payment_status');
            $table->index('order_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
