<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->unique(['business_id', 'name']);
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name', 160);
            $table->string('slug', 180);
            $table->text('description')->nullable();

            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('buffer_minutes')->default(0);
            $table->unsignedBigInteger('price_cents');

            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->unique(['business_id', 'slug']);
            $table->index(['business_id', 'is_active', 'sort_order']);
        });

        Schema::create('professional_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();

            // Null means "inherit the service value".
            $table->unsignedBigInteger('price_cents')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestampsTz();

            $table->unique(['professional_profile_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_service');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};
