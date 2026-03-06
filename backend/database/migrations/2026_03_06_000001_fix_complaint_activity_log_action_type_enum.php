<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the complaint_activity_log table if it doesn't exist,
     * or ensure the action_type enum includes all required values if it does.
     */
    public function up(): void
    {
        if (! Schema::hasTable('complaint_activity_log')) {
            Schema::create('complaint_activity_log', function (Blueprint $table) {
                $table->id();
                $table->foreignId('complaint_id')->constrained('complaints')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->enum('action_type', ['status_change', 'assignment', 'comment', 'note']);
                $table->string('old_status')->nullable();
                $table->string('new_status')->nullable();
                $table->text('body')->nullable();
                $table->timestamps();

                $table->index('complaint_id');
            });
        } else {
            \DB::statement("ALTER TABLE complaint_activity_log MODIFY COLUMN action_type ENUM('status_change', 'assignment', 'comment', 'note') NOT NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_activity_log');
    }
};
