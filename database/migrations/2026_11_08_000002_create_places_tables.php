<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('department', 120);
            $table->string('slug', 120)->unique();
            $table->decimal('center_latitude', 10, 7);
            $table->decimal('center_longitude', 10, 7);
            $table->unsignedSmallInteger('radius_km')->default(15);
            $table->string('timezone', 64)->default('America/Bogota');
            $table->boolean('is_active')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('business_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 120)->unique();
            $table->string('description', 255)->nullable();
            $table->string('icon', 60)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('business_category_id')->constrained()->restrictOnDelete();

            $table->string('name', 160);
            $table->string('slug', 180)->unique();
            $table->string('tagline', 160)->nullable();
            $table->text('description')->nullable();

            $table->string('logo_path')->nullable();
            $table->string('cover_path')->nullable();

            $table->string('address_line', 255);
            $table->string('neighborhood', 120)->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('instagram', 190)->nullable();
            $table->string('website', 190)->nullable();

            $table->string('timezone', 64)->default('America/Bogota');
            $table->unsignedTinyInteger('price_level')->default(2);

            $table->boolean('is_published')->default(false);
            $table->boolean('is_demo')->default(false);
            $table->timestampTz('published_at')->nullable();

            // Denormalised aggregates, recalculated by domain actions only.
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('favorites_count')->default(0);
            $table->unsignedBigInteger('min_price_cents')->nullable();

            $table->jsonb('settings')->nullable();

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['city_id', 'is_published']);
            $table->index(['business_category_id', 'is_published']);
            $table->index('rating_avg');
            $table->index('min_price_cents');
        });

        // Spanish full-text search over the fields customers actually type.
        DB::statement(
            "CREATE INDEX businesses_search_idx ON businesses USING gin (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,'')))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('business_categories');
        Schema::dropIfExists('cities');
    }
};
