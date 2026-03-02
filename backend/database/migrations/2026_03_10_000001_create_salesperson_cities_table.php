<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salesperson_cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('city');
            $table->timestamps();
            $table->unique(['user_id', 'city']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salesperson_cities');
    }
};
