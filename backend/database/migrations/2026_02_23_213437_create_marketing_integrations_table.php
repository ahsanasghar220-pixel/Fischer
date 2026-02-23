<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('marketing_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('platform')->unique(); // meta, google_analytics, google_ads, tiktok, snapchat, pinterest
            $table->boolean('is_enabled')->default(false);
            $table->json('config')->nullable(); // pixel_id, api_key, etc.
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('marketing_integrations');
    }
};
