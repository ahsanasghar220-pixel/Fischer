<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('portfolio_videos')) {
            Schema::create('portfolio_videos', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('video_url');
                $table->string('thumbnail')->nullable();
                $table->string('category')->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_visible')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Don't drop - the original migration handles that
    }
};
