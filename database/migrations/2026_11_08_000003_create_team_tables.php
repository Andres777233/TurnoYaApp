<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('role', 20)->default('professional');
            $table->string('status', 20)->default('active');

            $table->boolean('can_manage_business')->default(false);
            $table->boolean('can_manage_team')->default(false);
            $table->boolean('can_view_finances')->default(false);
            $table->boolean('performs_services')->default(false);

            $table->foreignId('invited_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('invited_email', 190)->nullable();
            $table->string('invitation_token', 64)->nullable()->unique();
            $table->timestampTz('invitation_expires_at')->nullable();
            $table->timestampTz('accepted_at')->nullable();
            $table->timestampTz('revoked_at')->nullable();

            $table->timestampsTz();

            $table->unique(['business_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['business_id', 'role', 'status']);
        });

        Schema::create('specialties', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 120)->unique();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
        });

        Schema::create('professional_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('display_name', 160);
            $table->string('slug', 180)->unique();
            $table->string('headline', 160)->nullable();
            $table->text('bio')->nullable();

            $table->string('avatar_path')->nullable();
            $table->string('cover_path')->nullable();

            $table->unsignedSmallInteger('years_experience')->nullable();
            $table->boolean('is_public')->default(true);
            $table->boolean('is_accepting_bookings')->default(true);
            $table->boolean('is_demo')->default(false);

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->unique(['business_id', 'user_id']);
            $table->index(['business_id', 'is_public']);
        });

        Schema::create('professional_specialty', function (Blueprint $table) {
            $table->foreignId('professional_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('specialty_id')->constrained()->cascadeOnDelete();

            $table->primary(['professional_profile_id', 'specialty_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_specialty');
        Schema::dropIfExists('professional_profiles');
        Schema::dropIfExists('specialties');
        Schema::dropIfExists('business_memberships');
    }
};
