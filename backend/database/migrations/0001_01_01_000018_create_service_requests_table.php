<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Customer info
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('city');
            $table->text('address');

            // Product info
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('model_number')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->boolean('under_warranty')->default(false);

            // Service details
            $table->enum('service_type', [
                'installation',
                'repair',
                'maintenance',
                'warranty_claim',
                'replacement',
                'other'
            ])->default('repair');
            $table->text('problem_description');
            $table->json('images')->nullable();

            // Status and assignment
            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'on_hold',
                'completed',
                'cancelled'
            ])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('scheduled_date')->nullable();
            $table->string('scheduled_time_slot')->nullable();

            // Resolution
            $table->text('diagnosis')->nullable();
            $table->text('resolution')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('final_cost', 10, 2)->nullable();
            $table->timestamp('completed_at')->nullable();

            // Feedback
            $table->tinyInteger('customer_rating')->nullable();
            $table->text('customer_feedback')->nullable();

            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'priority']);
            $table->index('assigned_to');
            $table->index('ticket_number');
        });

        // Service request history
        Schema::create('service_request_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_request_history');
        Schema::dropIfExists('service_requests');
    }
};
