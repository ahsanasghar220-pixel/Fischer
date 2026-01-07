<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Daily sales analytics
        Schema::create('analytics_daily_sales', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->integer('orders_count')->default(0);
            $table->decimal('orders_total', 14, 2)->default(0);
            $table->integer('items_sold')->default(0);
            $table->decimal('average_order_value', 12, 2)->default(0);
            $table->integer('new_customers')->default(0);
            $table->integer('returning_customers')->default(0);
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('refund_total', 12, 2)->default(0);
            $table->timestamps();

            $table->index('date');
        });

        // Product analytics
        Schema::create('analytics_product_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->integer('views')->default(0);
            $table->integer('add_to_cart')->default(0);
            $table->integer('purchases')->default(0);
            $table->decimal('revenue', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'date']);
            $table->index('date');
        });

        // Category analytics
        Schema::create('analytics_category_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->integer('views')->default(0);
            $table->integer('purchases')->default(0);
            $table->decimal('revenue', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['category_id', 'date']);
        });

        // Traffic analytics
        Schema::create('analytics_traffic', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('source')->default('direct'); // direct, organic, social, referral, paid
            $table->string('medium')->nullable();
            $table->string('campaign')->nullable();
            $table->integer('visits')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('page_views')->default(0);
            $table->decimal('bounce_rate', 5, 2)->default(0);
            $table->integer('avg_session_duration')->default(0);
            $table->timestamps();

            $table->unique(['date', 'source', 'medium', 'campaign'], 'traffic_unique');
        });

        // Conversion funnel
        Schema::create('analytics_funnel', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('product_views')->default(0);
            $table->integer('add_to_cart')->default(0);
            $table->integer('checkout_initiated')->default(0);
            $table->integer('checkout_completed')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('cart_abandonment_rate', 5, 2)->default(0);
            $table->timestamps();

            $table->unique('date');
        });

        // Customer cohort analysis
        Schema::create('analytics_cohorts', function (Blueprint $table) {
            $table->id();
            $table->string('cohort_month', 7); // YYYY-MM
            $table->integer('month_number'); // 0, 1, 2, etc. (months since cohort)
            $table->integer('customers_count')->default(0);
            $table->integer('orders_count')->default(0);
            $table->decimal('revenue', 14, 2)->default(0);
            $table->decimal('retention_rate', 5, 2)->default(0);
            $table->timestamps();

            $table->unique(['cohort_month', 'month_number']);
        });

        // Inventory tracking
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('type', ['purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer']);
            $table->integer('quantity'); // positive for in, negative for out
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('analytics_cohorts');
        Schema::dropIfExists('analytics_funnel');
        Schema::dropIfExists('analytics_traffic');
        Schema::dropIfExists('analytics_category_stats');
        Schema::dropIfExists('analytics_product_stats');
        Schema::dropIfExists('analytics_daily_sales');
    }
};
