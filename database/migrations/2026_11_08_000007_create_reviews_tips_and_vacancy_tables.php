<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->timestampTz('reminder_responded_at')->nullable()->after('reminder_sent_at');
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professional_profile_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->string('status', 16)->default('approved');
            $table->boolean('is_demo')->default(false);

            $table->timestampsTz();

            $table->index(['professional_profile_id', 'status']);
            $table->index(['business_id', 'status']);
        });

        // A single appointment can be reviewed once for the business and once
        // for the professional, so the business uniqueness is partial.
        DB::statement('CREATE UNIQUE INDEX reviews_appointment_business_unique ON reviews (appointment_id, business_id) WHERE professional_profile_id IS NULL');
        DB::statement('CREATE UNIQUE INDEX reviews_appointment_professional_unique ON reviews (appointment_id, professional_profile_id) WHERE professional_profile_id IS NOT NULL');

        Schema::create('tip_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_profile_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16); // nequi, bancolombia, daviplata, nu, link
            $table->string('label', 60)->nullable();
            $table->string('account_holder', 120)->nullable();
            $table->string('account_value', 190); // phone, key or URL
            $table->string('qr_path')->nullable();
            $table->string('payment_link')->nullable();
            $table->string('instructions', 255)->nullable();
            $table->boolean('is_visible')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->unique(['professional_profile_id', 'type', 'account_value'], 'tip_methods_unique');
        });

        Schema::create('vacancy_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professional_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('released_from_appointment_id')->nullable()->constrained('appointments')->nullOnDelete();

            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->timestampTz('blocked_until');

            $table->string('status', 16)->default('open'); // open, claimed, expired
            $table->foreignId('claimed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('claimed_at')->nullable();
            $table->timestampTz('expires_at');
            $table->timestampsTz();

            $table->index(['status', 'expires_at']);
            $table->index(['business_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancy_offers');
        Schema::dropIfExists('tip_payment_methods');
        Schema::dropIfExists('reviews');

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('reminder_responded_at');
        });
    }
};
