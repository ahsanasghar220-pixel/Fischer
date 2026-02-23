<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('marketing_conversion_logs', function (Blueprint $table) {
            $table->id();
            $table->string('platform');
            $table->string('event_type'); // Purchase, AddToCart, etc.
            $table->unsignedBigInteger('order_id')->nullable();
            $table->json('payload')->nullable();
            $table->json('response')->nullable();
            $table->string('status')->default('pending'); // pending, success, failed
            $table->text('error_message')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }
    public function down(): void {
        Schema::dropIfExists('marketing_conversion_logs');
    }
};
