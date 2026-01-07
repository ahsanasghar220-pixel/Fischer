<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Loyalty transactions
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['earned', 'redeemed', 'expired', 'adjusted', 'referral_bonus']);
            $table->integer('points');
            $table->integer('balance_after');
            $table->string('description');
            $table->morphs('reference'); // order_id, referral_id, etc.
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('expires_at');
        });

        // Referrals
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'completed', 'rewarded'])->default('pending');
            $table->integer('referrer_points_earned')->default(0);
            $table->integer('referred_points_earned')->default(0);
            $table->foreignId('qualifying_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();

            $table->index(['referrer_id', 'status']);
        });

        // Gift cards
        Schema::create('gift_cards', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->decimal('initial_balance', 12, 2);
            $table->decimal('current_balance', 12, 2);
            $table->foreignId('purchased_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recipient_email')->nullable();
            $table->string('recipient_name')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['active', 'used', 'expired', 'disabled'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['code', 'status']);
        });

        Schema::create('gift_card_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gift_card_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->timestamps();
        });

        // Abandoned carts
        Schema::create('abandoned_cart_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('email')->nullable();
            $table->integer('reminder_count')->default(0);
            $table->timestamp('last_reminder_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->foreignId('converted_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();

            $table->index(['cart_id', 'reminder_count']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abandoned_cart_reminders');
        Schema::dropIfExists('gift_card_transactions');
        Schema::dropIfExists('gift_cards');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('loyalty_transactions');
    }
};
