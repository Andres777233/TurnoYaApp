<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('working_hours', function (Blueprint $table) {
            $table->id();
            // owner_type is Business::class or ProfessionalProfile::class
            $table->string('owner_type', 60);
            $table->unsignedBigInteger('owner_id');
            $table->unsignedTinyInteger('weekday'); // 0 = Sunday … 6 = Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index(['owner_type', 'owner_id', 'weekday'], 'working_hours_owner_idx');
        });

        Schema::create('breaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('working_hour_id')->constrained()->cascadeOnDelete();
            $table->time('start_time');
            $table->time('end_time');
            $table->string('label', 80)->nullable();
            $table->timestampsTz();
        });

        Schema::create('availability_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_profile_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->string('reason', 160)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampsTz();

            $table->index(['professional_profile_id', 'starts_at', 'ends_at'], 'availability_blocks_range_idx');
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->unique();

            $table->foreignId('business_id')->constrained()->restrictOnDelete();
            $table->foreignId('professional_profile_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();

            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->timestampTz('blocked_until');

            $table->string('status', 24)->default('confirmed');

            $table->unsignedBigInteger('price_cents');
            $table->char('currency', 3)->default('COP');
            $table->string('payment_policy', 16)->default('none');
            $table->unsignedBigInteger('payment_due_cents')->default(0);
            $table->timestampTz('held_until')->nullable();

            $table->text('customer_notes')->nullable();

            $table->string('cancellation_reason', 255)->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestampTz('attendance_confirmed_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('no_show_at')->nullable();
            $table->timestampTz('reminder_sent_at')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['professional_profile_id', 'starts_at']);
            $table->index(['business_id', 'starts_at']);
            $table->index(['customer_id', 'starts_at']);
            $table->index(['status', 'starts_at']);
        });

        Schema::create('appointment_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 255)->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['appointment_id', 'created_at']);
        });

        // The authoritative guard against double booking. Application-level
        // checks are advisory; this constraint is the final word.
        DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gist');
        DB::statement(<<<'SQL'
            ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap
            EXCLUDE USING gist (
                professional_profile_id WITH =,
                tstzrange(starts_at, blocked_until, '[)') WITH &&
            ) WHERE (status IN ('pending_payment', 'confirmed', 'attendance_confirmed', 'completed'))
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_status_history');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('availability_blocks');
        Schema::dropIfExists('breaks');
        Schema::dropIfExists('working_hours');
    }
};
