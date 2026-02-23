<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('session_id')->nullable()->index();
            $table->json('cart_data');
            $table->decimal('cart_total', 10, 2)->default(0);
            $table->timestamp('last_activity_at');
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('reminder_sent_at')->nullable();
            $table->boolean('is_recovered')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('abandoned_carts');
    }
};
