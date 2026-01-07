<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dealers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('contact_person');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();
            $table->string('city');
            $table->text('address');
            $table->string('ntn_number')->nullable();
            $table->string('strn_number')->nullable();
            $table->year('established_year')->nullable();
            $table->enum('business_type', [
                'electronics_store',
                'multibrand_retail',
                'ecommerce',
                'distributor',
                'other'
            ]);
            $table->text('current_brands')->nullable();
            $table->text('additional_details')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->decimal('credit_limit', 12, 2)->default(0);
            $table->decimal('current_credit', 12, 2)->default(0);
            $table->integer('discount_percentage')->default(0);
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'city']);
            $table->index('business_name');
        });

        // Dealer documents
        Schema::create('dealer_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dealer_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['cnic', 'ntn', 'business_registration', 'other']);
            $table->string('name');
            $table->string('file');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dealer_documents');
        Schema::dropIfExists('dealers');
    }
};
