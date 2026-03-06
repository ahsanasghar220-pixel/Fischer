<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ensure the complaint_activity_log.action_type enum includes all required values.
     * This migration is idempotent — safe to run even if the column already has the correct values.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE complaint_activity_log MODIFY COLUMN action_type ENUM('status_change', 'assignment', 'comment', 'note') NOT NULL");
    }

    public function down(): void
    {
        // No rollback needed — downgrading the enum would risk data loss
    }
};
