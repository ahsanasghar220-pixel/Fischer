<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundle_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundle_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100); // e.g., "Choose Your Cooler"
            $table->text('description')->nullable();
            $table->integer('slot_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->integer('min_selections')->default(1);
            $table->integer('max_selections')->default(1);
            $table->timestamps();

            $table->index('bundle_id');
            $table->index('slot_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundle_slots');
    }
};
